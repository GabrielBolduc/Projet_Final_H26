import { Component, computed, inject, resource } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { AuthService } from '@core/services/auth.service';
import { Order } from '@core/models/order';
import { OrderService } from '@core/services/order.service';

@Component({
  selector: 'app-ticketing-orders',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './orders.html',
  styleUrl: './orders.css'
})
export class TicketingOrdersComponent {
  private auth = inject(AuthService);
  private orderService = inject(OrderService);

  isClient = computed(() => this.auth.currentUser()?.isClient ?? false);

  ordersResource = resource<Order[], { isClient: boolean }>({
    params: () => ({ isClient: this.isClient() }),
    loader: ({ params }) => {
      if (!params.isClient) {
        return Promise.resolve([]);
      }

      return firstValueFrom(this.orderService.getMyOrders());
    }
  });

  orders = computed(() => this.ordersResource.value() ?? []);
  isLoading = computed(() => this.ordersResource.isLoading());
}
