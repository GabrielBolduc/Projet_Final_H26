import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { Ticket } from '@core/models/ticket';
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
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  templateUrl: './ticket-detail.html',
  styleUrl: './ticket-detail.css'
})
export class TicketingTicketDetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketService);
  private translate = inject(TranslateService);

  ticketId = computed(() => Number(this.route.snapshot.paramMap.get('id')));
  ticket = signal<Ticket | null>(null);
  backOrdersLink = computed(() => {
    const orderId = this.ticket()?.order_id;
    return orderId ? ['/ticketing/orders', orderId] : ['/ticketing/orders'];
  });
  qrIsInvalid = computed(() => {
    const currentTicket = this.ticket();
    if (!currentTicket) {
      return false;
    }

    if (currentTicket.refunded) {
      return true;
    }

    const expiredAt = this.toDate(currentTicket.package.expired_at);
    if (!expiredAt) {
      return true;
    }

    const now = new Date();
    return now > expiredAt;
  });
  isLoading = signal(true);
  isSaving = signal(false);
  isRefunding = signal(false);
  formError = signal('');
  formSuccess = signal('');

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

  async ngOnInit(): Promise<void> {
    await this.loadTicket();
  }

  async updateTicketDetails(): Promise<void> {
    this.formError.set('');
    this.formSuccess.set('');

    const currentTicket = this.ticket();
    if (!currentTicket) {
      this.formError.set('Ticket not found.');
      return;
    }

    if (currentTicket.refunded) {
      this.formError.set('Refunded tickets cannot be modified.');
      return;
    }

    this.ticketForm.markAllAsTouched();
    if (this.ticketForm.invalid) {
      this.formError.set('Please correct the invalid fields.');
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
      this.formSuccess.set('Ticket details updated successfully.');
    } catch (err: any) {
      this.formError.set(this.extractError(err, 'Unable to update ticket.'));
    } finally {
      this.isSaving.set(false);
    }
  }

  async refundTicket(): Promise<void> {
    this.formError.set('');
    this.formSuccess.set('');

    const currentTicket = this.ticket();
    if (!currentTicket) {
      this.formError.set('Ticket not found.');
      return;
    }

    if (currentTicket.refunded) {
      this.formError.set('Ticket is already refunded.');
      return;
    }

    const confirmed = window.confirm(this.translate.instant('TICKETING_PUBLIC.REFUND_CONFIRM'));
    if (!confirmed) {
      return;
    }

    this.isRefunding.set(true);

    try {
      const refundedTicket = await firstValueFrom(this.ticketService.refundTicket(currentTicket.id));
      this.ticket.set(refundedTicket);
      this.populateForm(refundedTicket);
      this.formSuccess.set('Ticket refunded successfully.');
    } catch (err: any) {
      this.formError.set(this.extractError(err, 'Unable to refund ticket.'));
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

  private extractError(err: any, fallback: string): string {
    const errors = err?.errors;
    if (errors && typeof errors === 'object') {
      const flattened = Object.values(errors).flat().join(' | ');
      if (flattened) {
        return flattened;
      }
    }

    return String(err?.message || fallback);
  }

  private toDate(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
}
