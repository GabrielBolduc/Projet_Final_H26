import { Component, computed, inject, resource } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { Order } from '@core/models/order';
import { OrderService } from '@core/services/order.service';

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
}
