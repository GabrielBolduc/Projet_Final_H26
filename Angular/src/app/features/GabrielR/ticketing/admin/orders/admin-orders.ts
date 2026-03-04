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

  private initialized = false;

  searchQuery = signal('');
  sortOption = signal('desc');
  selectedFestivalId = signal<number | null>(null);

  ongoingFestivalResource = resource({
    loader: () => firstValueFrom(this.festivalService.getFestivals('ongoing'))
  });

  festivalsResource = resource({
    loader: () => firstValueFrom(this.festivalService.getFestivals())
  });

  ordersResource = resource({
    params: () => ({
      festival_id: this.selectedFestivalId() ?? undefined,
      q: this.searchQuery(),
      sort: this.sortOption()
    }),
    loader: ({ params }) => firstValueFrom(this.orderService.getAllOrders(params))
  });

  orders = computed(() => this.ordersResource.value() ?? []);
  festivals = computed(() => this.festivalsResource.value() ?? []);
  isLoading = computed(() => 
    this.ordersResource.isLoading() || 
    this.festivalsResource.isLoading() ||
    this.ongoingFestivalResource.isLoading()
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

    // Sélectionner par défaut le festival en cours s'il n'est pas déjà défini dans l'URL
    effect(() => {
      const ongoing = this.ongoingFestivalResource.value();
      if (ongoing && ongoing.length > 0 && !this.selectedFestivalId() && !this.route.snapshot.queryParams['festival_id']) {
        this.selectedFestivalId.set(ongoing[0].id);
      }
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;

    if (params['q']) {
      this.searchQuery.set(params['q']);
    }

    if (params['sort']) {
      this.sortOption.set(params['sort']);
    }

    if (params['festival_id']) {
      this.selectedFestivalId.set(Number(params['festival_id']));
    }

    this.initialized = true;
  }

  protected isRefunded = isRefunded;
  protected isExpired = isExpired;

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
}
