import { Component, inject, computed, resource, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

import { TicketingStatsService } from '@core/services/ticketing-stats.service';
import { TicketingStats } from '@core/models/ticketing-stats';

@Component({
  selector: 'app-billetterie',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    FormsModule,
    MatIconModule,
    MatFormFieldModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './billetterie.html',
  styleUrls: ['./billetterie.css']
})
export class BilletterieComponent {
  public translate = inject(TranslateService);
  private ticketingStatsService = inject(TicketingStatsService);

  startDate = signal<string>('');
  endDate = signal<string>('');
  categoryFilters = signal({
    general: true,
    daily: true,
    evening: true
  });

  selectedCategories = computed(() => {
    const filters = this.categoryFilters();
    const categories: string[] = [];
    if (filters.general) categories.push('general');
    if (filters.daily) categories.push('daily');
    if (filters.evening) categories.push('evening');
    return categories;
  });

  statsResource = resource<TicketingStats[], { start_date?: string; end_date?: string; categories?: string }>({
    params: () => {
      const categories = this.selectedCategories();
      return {
        start_date: this.startDate() || undefined,
        end_date: this.endDate() || undefined,
        categories: categories.length ? categories.join(',') : undefined
      };
    },
    loader: ({ params }) => firstValueFrom(this.ticketingStatsService.getStats(params))
  });

  stats = computed(() => this.statsResource.value() ?? []);
  isLoading = computed(() => this.statsResource.isLoading());

  displayedColumns: string[] = [
    'festival',
    'expenses_total',
    'expenses_performance',
    'expenses_other',
    'revenues_total',
    'revenues_tickets',
    'revenues_other',
    'profit',
    'total_tickets',
    'avg_tickets',
    'refunds_count'
  ];

  toggleCategory(key: 'general' | 'daily' | 'evening', checked: boolean): void {
    this.categoryFilters.update(filters => {
      const next = { ...filters, [key]: checked };
      if (!next.general && !next.daily && !next.evening) {
        return { ...filters, [key]: true };
      }
      return next;
    });
  }
}
