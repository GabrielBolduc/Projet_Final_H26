import { Component, OnInit, TemplateRef, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { Ticket, isRefunded } from '@core/models/ticket';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { TicketService } from '@core/services/ticket.service';

@Component({
  selector: 'app-ticketing-ticket-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    TranslateModule,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css'
})
export class TicketingTicketDetailComponent implements OnInit {
  @ViewChild('refundConfirmDialogTemplate') refundConfirmDialogTemplate!: TemplateRef<unknown>;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private ticketService = inject(TicketService);
  private errorHandler = inject(ErrorHandlerService);

  ticketId = computed(() => Number(this.route.snapshot.paramMap.get('id')));
  ticket = signal<Ticket | null>(null);
  backOrdersLink = computed(() => {
    const orderId = this.ticket()?.order_id;
    return orderId ? ['/ticketing/orders', orderId] : ['/ticketing/orders'];
  });
  
  ticketIsRefunded = computed(() => isRefunded(this.ticket()));

  ticketIsExpired = computed(() => {
    const currentTicket = this.ticket();
    if (!currentTicket) return false;

    const expiredAt = this.toDate(currentTicket.package.expired_at);
    return !!expiredAt && new Date() > expiredAt;
  });

  qrIsInvalid = computed(() => this.ticketIsRefunded() || this.ticketIsExpired());

  isLoading = signal(true);
  isSaving = signal(false);
  isRefunding = signal(false);
  formError = signal('');
  formErrorParams = signal<Record<string, unknown> | undefined>(undefined);
  formSuccess = signal('');
  formSuccessParams = signal<Record<string, unknown> | undefined>(undefined);

  ticketForm: FormGroup = this.fb.group({
    holder_name: ['', [Validators.required, Validators.maxLength(100)]],
    holder_email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    holder_phone: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[0-9+\-() ]+$/)]]
  });

  get holderNameControl() {
    return this.ticketForm.get('holder_name');
  }

  get holderEmailControl() {
    return this.ticketForm.get('holder_email');
  }

  get holderPhoneControl() {
    return this.ticketForm.get('holder_phone');
  }

  constructor() {
    effect(() => {
      if (this.ticketIsRefunded() || this.ticketIsExpired()) {
        this.ticketForm.disable();
      } else {
        this.ticketForm.enable();
      }
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadTicket();
  }

  async updateTicketDetails(): Promise<void> {
    this.setFormErrorText('');
    this.setFormSuccessText('');

    const currentTicket = this.ticket();
    if (!currentTicket) {
      this.setFormErrorKey('TICKETING_PUBLIC.TICKET_NOT_FOUND');
      return;
    }

    if (this.ticketIsRefunded()) {
      this.setFormErrorKey('TICKETING_PUBLIC.CANNOT_EDIT_REFUNDED');
      return;
    }

    if (this.ticketIsExpired()) {
      this.setFormErrorKey('TICKETING_PUBLIC.CANNOT_EDIT_EXPIRED');
      return;
    }

    this.ticketForm.markAllAsTouched();
    if (this.ticketForm.invalid) {
      this.setFormErrorKey('TICKETING_PUBLIC.FORM_INVALID');
      return;
    }

    if (this.ticketForm.pristine) {
      this.setFormSuccessKey('TICKETING_PUBLIC.NO_CHANGES');
      return;
    }

    this.isSaving.set(true);

    try {
      const updatedTicket = await firstValueFrom(
        this.ticketService.updateTicket(currentTicket.id, {
          holder_name: String(this.holderNameControl?.value ?? '').trim(),
          holder_email: String(this.holderEmailControl?.value ?? '').trim(),
          holder_phone: String(this.holderPhoneControl?.value ?? '').trim()
        })
      );

      this.ticket.set(updatedTicket);
      this.populateForm(updatedTicket);
      await this.navigateToOrderDetails(updatedTicket.order_id ?? currentTicket.order_id);
    } catch (err: any) {
      this.setFormErrorText(this.extractError(err, 'TICKETING_PUBLIC.UPDATE_FAILED'));
    } finally {
      this.isSaving.set(false);
    }
  }

  async refundTicket(): Promise<void> {
    this.setFormErrorText('');
    this.setFormSuccessText('');

    const currentTicket = this.ticket();
    if (!currentTicket) {
      this.setFormErrorKey('TICKETING_PUBLIC.TICKET_NOT_FOUND');
      return;
    }

    if (this.ticketIsRefunded()) {
      this.setFormErrorKey('TICKETING_PUBLIC.ALREADY_REFUNDED');
      return;
    }

    if (this.ticketIsExpired()) {
      this.setFormErrorKey('TICKETING_PUBLIC.CANNOT_REFUND_EXPIRED');
      return;
    }

    const dialogRef = this.dialog.open(this.refundConfirmDialogTemplate, {
      width: '420px'
    });

    const confirmed = await firstValueFrom(dialogRef.afterClosed());
    if (!confirmed) {
      return;
    }

    this.isRefunding.set(true);

    try {
      const refundedTicket = await firstValueFrom(this.ticketService.refundTicket(currentTicket.id));
      this.ticket.set(refundedTicket);
      this.populateForm(refundedTicket);
      await this.openTranslatedSnackBar('TICKETING_PUBLIC.REFUND_SUCCESS', 3000);
      await this.navigateToOrderDetails(refundedTicket.order_id ?? currentTicket.order_id);
    } catch {
      await this.openTranslatedSnackBar('TICKETING_PUBLIC.REFUND_FAILED', 5000);
    } finally {
      this.isRefunding.set(false);
    }
  }

  private async loadTicket(): Promise<void> {
    this.isLoading.set(true);
    this.formError.set('');

    const id = this.ticketId();
    if (!Number.isInteger(id) || id <= 0) {
      this.ticket.set(null);
      this.isLoading.set(false);
      return;
    }

    try {
      const loadedTicket = await firstValueFrom(this.ticketService.getTicket(id));
      this.ticket.set(loadedTicket);
      this.populateForm(loadedTicket);
    } catch {
      this.ticket.set(null);
    } finally {
      this.isLoading.set(false);
    }
  }

  private populateForm(ticket: Ticket): void {
    this.ticketForm.patchValue({
      holder_name: ticket.holder_name,
      holder_email: ticket.holder_email,
      holder_phone: ticket.holder_phone
    });

    this.ticketForm.markAsPristine();
    this.ticketForm.markAsUntouched();
  }

  private extractError(err: any, fallbackKey: string): string {
    const parsedErrors = this.errorHandler.parseRailsErrors(err);
    if (parsedErrors.length > 0) {
      return parsedErrors.join(' | ');
    }
    return fallbackKey;
  }

  private async openTranslatedSnackBar(messageKey: string, duration: number): Promise<void> {
    const labels = await firstValueFrom(this.translate.get([messageKey, 'COMMON.CLOSE']));
    const message = labels[messageKey] ?? this.translate.instant(messageKey);
    const closeLabel = labels['COMMON.CLOSE'] ?? this.translate.instant('COMMON.CLOSE');

    this.snackBar.open(
      message,
      closeLabel,
      { duration }
    );
  }

  private setFormErrorKey(key: string, params?: Record<string, unknown>): void {
    this.formError.set(key);
    this.formErrorParams.set(params);
  }

  private setFormErrorText(message: string): void {
    this.formError.set(message);
    this.formErrorParams.set(undefined);
  }

  private setFormSuccessKey(key: string, params?: Record<string, unknown>): void {
    this.formSuccess.set(key);
    this.formSuccessParams.set(params);
  }

  private setFormSuccessText(message: string): void {
    this.formSuccess.set(message);
    this.formSuccessParams.set(undefined);
  }

  private toDate(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private async navigateToOrderDetails(orderId: number | null | undefined): Promise<void> {
    if (orderId && Number.isInteger(orderId) && orderId > 0) {
      await this.router.navigate(['/ticketing/orders', orderId]);
      return;
    }

    await this.router.navigate(['/ticketing/orders']);
  }
}
