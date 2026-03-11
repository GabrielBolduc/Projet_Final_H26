import { Component, inject, computed, resource, signal, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';

import { TicketingStatsService } from '@core/services/ticketing-stats.service';
import { TicketingStats } from '@core/models/ticketing-stats';
import { DateUtils } from '@core/utils/date.utils';

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
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './billetterie.html',
  styleUrls: ['./billetterie.css']
})
export class BilletterieComponent implements OnInit {
  public translate = inject(TranslateService);
  private ticketingStatsService = inject(TicketingStatsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  startDate = signal<Date | null>(null);
  endDate = signal<Date | null>(null);
  categoryFilters = signal({
    general: true,
    daily: true,
    evening: true
  });
  private initialized = false;

  selectedCategories = computed(() => {
    const filters = this.categoryFilters();
    const categories: string[] = [];
    if (filters.general) categories.push('general');
    if (filters.daily) categories.push('daily');
    if (filters.evening) categories.push('evening');
    return categories;
  });

  statsResource = resource<TicketingStats[], { start_date?: string; end_date?: string; categories?: string; no_results?: boolean }>({
    params: () => {
      const categories = this.selectedCategories();
      if (categories.length === 0) {
        return { no_results: true };
      }
      return {
        start_date: this.normalizeDate(this.startDate()) || undefined,
        end_date: this.normalizeDate(this.endDate()) || undefined,
        categories: categories.length ? categories.join(',') : undefined
      };
    },
    loader: ({ params }) => {
      if (params?.no_results) {
        return Promise.resolve([]);
      }
      return firstValueFrom(this.ticketingStatsService.getStats(params));
    }
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

  constructor() {
    effect(() => {
      if (!this.initialized) return;

      const categories = this.selectedCategories();
      const queryParams = {
        start_date: this.normalizeDate(this.startDate()) || null,
        end_date: this.normalizeDate(this.endDate()) || null,
        categories: categories.length ? categories.join(',') : 'none'
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
    const params = this.route.snapshot.queryParams;

    if (params['start_date']) {
      this.startDate.set(this.parseDateParam(params['start_date']));
    }

    if (params['end_date']) {
      this.endDate.set(this.parseDateParam(params['end_date']));
    }

    if (params['categories']) {
      const raw = params['categories'].toString().trim().toLowerCase();
      if (raw === 'none') {
        this.categoryFilters.set({
          general: false,
          daily: false,
          evening: false
        });
      } else {
        const categories = raw
          .split(',')
          .map((value: string) => value.trim().toLowerCase())
          .filter(Boolean);

        this.categoryFilters.set({
          general: categories.includes('general'),
          daily: categories.includes('daily'),
          evening: categories.includes('evening')
        });
      }
    }

    this.initialized = true;
  }

  onDateChange(kind: 'start' | 'end', value: Date | null, rawValue: string): void {
    const trimmed = rawValue?.trim() ?? '';
    const localDate = this.parseLocalDateString(trimmed) ?? this.parseYearOnlyString(trimmed);
    const nextValue = localDate ?? value ?? null;

    if (kind === 'start') {
      this.startDate.set(nextValue);
    } else {
      this.endDate.set(nextValue);
    }
  }

  toggleCategory(key: 'general' | 'daily' | 'evening', checked: boolean): void {
    this.categoryFilters.update(filters => {
      return { ...filters, [key]: checked };
    });
  }

  private parseDateParam(value: string | undefined | null): Date | null {
    if (!value) return null;
    const localDate = this.parseLocalDateString(value);
    if (localDate) return localDate;
    const yearOnlyDate = this.parseYearOnlyString(value);
    if (yearOnlyDate) return yearOnlyDate;
    const date = DateUtils.toDate(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private normalizeDate(value: Date | string | undefined | null): string {
    if (!value) return '';
    if (typeof value === 'string') {
      const localDate = this.parseLocalDateString(value);
      if (localDate) return this.formatLocalDate(localDate);
      const yearOnlyDate = this.parseYearOnlyString(value);
      if (yearOnlyDate) return this.formatLocalDate(yearOnlyDate);
    }
    const date = DateUtils.toDate(value);
    if (Number.isNaN(date.getTime())) return '';
    if (this.hasNonZeroTime(date)) {
      return this.formatUtcDate(date);
    }
    return this.formatLocalDate(date);
  }

  private parseLocalDateString(value: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) return null;
    if (date.getFullYear() !== year) return null;
    if (date.getMonth() !== month - 1) return null;
    if (date.getDate() !== day) return null;

    return date;
  }

  private parseYearOnlyString(value: string): Date | null {
    const match = /^(\d{4})$/.exec(value.trim());
    if (!match) return null;

    const year = Number(match[1]);
    const date = new Date(year, 0, 1);

    if (Number.isNaN(date.getTime())) return null;
    if (date.getFullYear() !== year) return null;

    return date;
  }

  private hasNonZeroTime(date: Date): boolean {
    return date.getHours() !== 0 ||
      date.getMinutes() !== 0 ||
      date.getSeconds() !== 0 ||
      date.getMilliseconds() !== 0;
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatUtcDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
