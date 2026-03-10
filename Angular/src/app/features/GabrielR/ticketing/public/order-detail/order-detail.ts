import { Component, computed, inject, resource } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Order } from '@core/models/order';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { OrderService } from '@core/services/order.service';
import { isRefunded, isExpired } from '@core/models/ticket';

@Component({
  selector: 'app-ticketing-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css'
})
export class TicketingOrderDetailComponent {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private errorHandler = inject(ErrorHandlerService);

  orderId = computed(() => Number(this.route.snapshot.paramMap.get('id')));

  orderResource = resource<Order | null, { id: number }>({
    params: () => ({ id: this.orderId() }),
    loader: ({ params }) => {
      if (!Number.isInteger(params.id) || params.id <= 0) {
        return Promise.resolve(null);
      }

      return firstValueFrom(this.orderService.getOrder(params.id));
    }
  });

  order = computed(() => this.orderResource.value());
  isLoading = computed(() => this.orderResource.isLoading());
  loadError = computed(() => {
    const err = this.orderResource.error();
    if (!err) return '';
    return this.errorHandler.parseRailsErrors(err).join(' | ');
  });

  subtotal = computed(() => this.order()?.subtotal ?? 0);
  discount = computed(() => this.order()?.discount ?? 0);
  totalPrice = computed(() => this.order()?.total_price ?? 0);

  protected ticketStatusClass(ticket: Order['tickets'][number]): 'refunded' | 'expired' | 'active' {
    if (isRefunded(ticket)) {
      return 'refunded';
    }

    if (isExpired(ticket)) {
      return 'expired';
    }

    return 'active';
  }

  protected ticketStatusLabel(ticket: Order['tickets'][number]): string {
    const statusClass = this.ticketStatusClass(ticket);
    if (statusClass === 'refunded') {
      return 'TICKETING_PUBLIC.REFUNDED';
    }

    if (statusClass === 'expired') {
      return 'TICKETING_PUBLIC.EXPIRED';
    }

    return 'TICKETING_PUBLIC.ACTIVE';
  }
}
