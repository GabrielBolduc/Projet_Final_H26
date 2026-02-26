import { Component, computed, inject, resource, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { AuthService } from '@core/services/auth.service';
import { PackageService } from '@core/services/package.service';
import { OrderService } from '@core/services/order.service';
import { Package } from '@core/models/package';

@Component({
  selector: 'app-ticketing-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressBarModule
  ],
  templateUrl: './order-form.html',
  styleUrl: './order-form.css'
})
export class TicketingOrderFormComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private packageService = inject(PackageService);
  private orderService = inject(OrderService);

  isSubmittingOrder = signal(false);
  orderError = signal('');
  orderSuccess = signal('');
  quantity = signal(1);

  packageId = computed(() => Number(this.route.snapshot.paramMap.get('id')));
  isClient = computed(() => this.auth.currentUser()?.isClient ?? false);
  isAdmin = computed(() => this.auth.currentUser()?.isAdmin ?? false);
  currentUser = computed(() => this.auth.currentUser());

  orderForm: FormGroup = this.fb.group({
    holder_name: ['', [Validators.required, Validators.maxLength(100)]],
    holder_email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
    holder_phone: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[0-9+\-() ]+$/)]],
    quantity: [1, [Validators.required, Validators.min(1)]]
  });

  packageResource = resource<Package | null, { id: number }>({
    params: () => ({ id: this.packageId() }),
    loader: async ({ params }) => {
      if (!Number.isInteger(params.id) || params.id <= 0) {
        return null;
      }
      const pkg = await firstValueFrom(this.packageService.getPackage(params.id));
      return pkg;
    }
  });

  selectedPackage = computed(() => this.packageResource.value());

  packageAvailability = computed(() => {
    const pkg = this.selectedPackage();
    if (!pkg) {
      return { sold: 0, quota: 0, remaining: 0, percent: 0 };
    }
    const sold = pkg.sold ?? 0;
    const quota = pkg.quota ?? 0;
    const remaining = Math.max(0, quota - sold);
    const percent = quota > 0 ? Math.min(100, (sold / quota) * 100) : 0;
    return { sold, quota, remaining, percent };
  });

  totalPrice = computed(() => {
    const pkg = this.selectedPackage();
    if (!pkg?.price) return 0;
    return pkg.price * this.quantity();
  });

  constructor() {
    const user = this.auth.currentUser();
    if (user) {
      this.orderForm.patchValue({
        holder_name: user.name ?? '',
        holder_email: user.email ?? '',
        holder_phone: user.phone_number ?? ''
      });
    }
  }

  get holderNameControl() { return this.orderForm.get('holder_name'); }
  get holderEmailControl() { return this.orderForm.get('holder_email'); }
  get holderPhoneControl() { return this.orderForm.get('holder_phone'); }
  get quantityControl() { return this.orderForm.get('quantity'); }

  decreaseQuantity(): void {
    const current = Number(this.quantityControl?.value ?? 1);
    const next = Math.max(1, current - 1);
    this.quantityControl?.setValue(next);
    this.quantityControl?.markAsTouched();
    this.quantity.set(next);
  }

  increaseQuantity(): void {
    const current = Number(this.quantityControl?.value ?? 1);
    const remaining = this.packageAvailability().remaining;
    if (remaining <= 0) {
      this.quantityControl?.markAsTouched();
      return;
    }
    const next = Math.min(remaining, current + 1);
    this.quantityControl?.setValue(next);
    this.quantityControl?.markAsTouched();
    this.quantity.set(next);
  }

  async createOrder(): Promise<void> {
    this.orderError.set('');
    this.orderSuccess.set('');

    const pkg = this.selectedPackage();
    if (!pkg?.id) {
      this.orderError.set('Package not found.');
      return;
    }

    if (!this.isClient()) {
      this.orderError.set('Only clients can create ticket orders.');
      return;
    }

    this.orderForm.markAllAsTouched();
    if (this.orderForm.invalid) {
      this.orderError.set('Please correct the invalid fields.');
      return;
    }

    const quantity = Number(this.quantityControl?.value ?? 0);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      this.orderError.set('Quantity must be greater than 0.');
      return;
    }

    const remaining = this.packageAvailability().remaining;
    if (remaining <= 0) {
      this.orderError.set('This package is sold out.');
      return;
    }

    if (quantity > remaining) {
      this.orderError.set(`Only ${remaining} ticket(s) are still available.`);
      return;
    }

    this.isSubmittingOrder.set(true);

    try {
      const createdOrder = await firstValueFrom(this.orderService.createOrder({
        package_id: pkg.id,
        quantity,
        holder_name: String(this.holderNameControl?.value ?? '').trim(),
        holder_email: String(this.holderEmailControl?.value ?? '').trim(),
        holder_phone: String(this.holderPhoneControl?.value ?? '').trim()
      }));

      this.orderSuccess.set('Order confirmed successfully.');
      this.router.navigate(['/ticketing/orders', createdOrder.id]);
    } catch (err: any) {
      const message = err?.message;
      const errors = err?.errors;

      if (errors && typeof errors === 'object') {
        const flattened = Object.values(errors).flat().join(' | ');
        this.orderError.set(flattened || 'Unable to create order.');
      } else {
        this.orderError.set(String(message || 'Unable to create order.'));
      }
    } finally {
      this.isSubmittingOrder.set(false);
    }
  }

  redirectToLogin(): void {
    this.router.navigate(['/login'], {
      queryParams: { returnUrl: `/ticketing/packages/${this.packageId()}/order` }
    });
  }
}
