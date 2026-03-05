import { Component, computed, effect, inject, OnInit, resource, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';

import { OrderService } from '@core/services/order.service';
import { FestivalService } from '@core/services/festival.service';
import { isRefunded, isExpired } from '@core/models/ticket';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatExpansionModule
  ],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css'
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private festivalService = inject(FestivalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private initialQueryParams = this.route.snapshot.queryParams;

  private initialized = false;
  private readonly allowedSortOptions = new Set([ 'asc', 'desc' ]);

  searchQuery = signal(this.initialQueryParams['q'] || '');
  sortOption = signal(this.parseInitialSort(this.initialQueryParams['sort']));
  selectedFestivalId = signal<number | null>(
    this.initialQueryParams['festival_id'] ? Number(this.initialQueryParams['festival_id']) : null
  );

  festivalsResource = resource({
    loader: () => firstValueFrom(this.festivalService.getFestivals())
  });

  ongoingFestivals = computed(() =>
    (this.festivalsResource.value() ?? []).filter(festival => festival.status === 'ongoing')
  );

  ordersResource = resource({
    params: () => {
      const routeFestivalId = Number(this.initialQueryParams['festival_id']);
      const hasRouteFestivalId = Number.isInteger(routeFestivalId) && routeFestivalId > 0;

      if (!hasRouteFestivalId && this.festivalsResource.isLoading()) {
        return undefined;
      }

      const derivedFestivalId = this.selectedFestivalId() ?? (hasRouteFestivalId ? routeFestivalId : this.ongoingFestivals()[0]?.id);

      return {
        festival_id: derivedFestivalId ?? undefined,
        q: this.searchQuery(),
        sort: this.sortOption()
      };
    },
    loader: ({ params }) => {
      if (!params) {
        return Promise.resolve([]);
      }

      return firstValueFrom(this.orderService.getAllOrders(params));
    }
  });

  orders = computed(() => this.ordersResource.value() ?? []);
  festivals = computed(() => this.festivalsResource.value() ?? []);
  isLoading = computed(() => 
    this.ordersResource.isLoading() || 
    this.festivalsResource.isLoading()
  );

  constructor() {
    effect(() => {
      if (!this.initialized) return;

      const queryParams = {
        q: this.searchQuery() || null,
        sort: this.sortOption() === 'desc' ? null : this.sortOption(),
        festival_id: this.selectedFestivalId() || null
      };

      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    });

  }

  ngOnInit(): void {
    this.initialized = true;
  }

  detailedTicketsMap = signal<Map<number, any[]>>(new Map());

  async loadOrderDetail(orderId: number): Promise<void> {
    if (this.detailedTicketsMap().has(orderId)) return;

    try {
      const detailedOrder = await firstValueFrom(this.orderService.getAdminOrder(orderId));
      this.detailedTicketsMap.update(map => {
        const newMap = new Map(map);
        newMap.set(orderId, detailedOrder.tickets);
        return newMap;
      });
    } catch (err) {
      console.error('Error loading order details', err);
    }
  }

  protected ticketStatusClass(ticket: any): 'refunded' | 'expired' | 'active' {
    if (isRefunded(ticket)) {
      return 'refunded';
    }

    if (isExpired(ticket)) {
      return 'expired';
    }

    return 'active';
  }

  protected ticketStatusLabel(ticket: any): string {
    const statusClass = this.ticketStatusClass(ticket);
    if (statusClass === 'refunded') {
      return 'TICKETING_PUBLIC.REFUNDED';
    }

    if (statusClass === 'expired') {
      return 'TICKETING_PUBLIC.EXPIRED';
    }

    return 'TICKETING_PUBLIC.ACTIVE';
  }

  private parseInitialSort(value: unknown): string {
    const sort = String(value ?? '').trim();
    return this.allowedSortOptions.has(sort) ? sort : 'desc';
  }
}
