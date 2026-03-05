import { Component, OnInit, computed, effect, inject, resource, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '@core/services/auth.service';
import { Package } from '@core/models/package';
import { PackageFilters, PackageService, PackageSort } from '@core/services/package.service';

@Component({
  selector: 'app-ticketing',
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
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './ticketing.html',
  styleUrl: './ticketing.css',
})
export class Ticketing implements OnInit {
  private auth = inject(AuthService);
  private packageService = inject(PackageService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private initialQueryParams = this.route.snapshot.queryParams;
  private readonly allowedSortOptions: PackageSort[] = [ 'price_asc', 'price_desc', 'date_asc', 'date_desc' ];

  private initialized = false;
  readonly weekdayOptions = [
    { value: null as number | null, labelKey: 'TICKETING_PUBLIC.DAY_ALL' },
    { value: 0, labelKey: 'TICKETING_PUBLIC.DAY_SUNDAY' },
    { value: 1, labelKey: 'TICKETING_PUBLIC.DAY_MONDAY' },
    { value: 2, labelKey: 'TICKETING_PUBLIC.DAY_TUESDAY' },
    { value: 3, labelKey: 'TICKETING_PUBLIC.DAY_WEDNESDAY' },
    { value: 4, labelKey: 'TICKETING_PUBLIC.DAY_THURSDAY' },
    { value: 5, labelKey: 'TICKETING_PUBLIC.DAY_FRIDAY' },
    { value: 6, labelKey: 'TICKETING_PUBLIC.DAY_SATURDAY' }
  ];

  searchQuery = signal(this.initialQueryParams['q'] || '');
  selectedWeekday = signal<number | null>(this.parseInitialWeekday(this.initialQueryParams['dow']));
  sortOption = signal<PackageSort>(this.parseInitialSort(this.initialQueryParams['sort']));
  showGeneral = signal(this.initialQueryParams['gen'] !== 'f');
  showDaily = signal(this.initialQueryParams['day'] !== 'f');
  showEvening = signal(this.initialQueryParams['eve'] !== 'f');

  isLoggedIn = computed(() => this.auth.isLoggedIn());
  isClient = computed(() => this.auth.currentUser()?.isClient ?? false);

  selectedCategories = computed<Array<'general' | 'daily' | 'evening'>>(() => {
    const categories: Array<'general' | 'daily' | 'evening'> = [];

    if (this.showGeneral()) {
      categories.push('general');
    }
    if (this.showDaily()) {
      categories.push('daily');
    }
    if (this.showEvening()) {
      categories.push('evening');
    }

    return categories;
  });

  packagesResource = resource<Package[], PackageFilters>({
    params: () => ({
      sort: this.sortOption(),
      categories: this.selectedCategories()
    }),
    loader: ({ params }) => firstValueFrom(this.packageService.getPackages(params))
  });

  packages = computed(() => this.packagesResource.value() ?? []);
  filteredPackages = computed(() => {
    let result = this.packages();

    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      result = result.filter(pkg => 
        (pkg.title?.toLowerCase().includes(query)) || 
        (pkg.description?.toLowerCase().includes(query))
      );
    }

    const weekday = this.selectedWeekday();
    if (weekday !== null) {
      result = result.filter(pkg => this.packageIncludesWeekday(pkg, weekday));
    }

    return result;
  });

  isLoading = computed(() => this.packagesResource.isLoading());
  hasActiveFilters = computed(() =>
    this.searchQuery().trim() !== '' ||
    this.selectedWeekday() !== null || 
    this.selectedCategories().length < 3
  );
  emptyStateKey = computed(() => {
    return this.hasActiveFilters()
      ? 'TICKETING_PUBLIC.EMPTY'
      : 'TICKETING_PUBLIC.EMPTY_NO_PACKAGES';
  });
  emptyStateTitleKey = computed(() =>
    this.hasActiveFilters()
      ? 'TICKETING_PUBLIC.EMPTY_FILTER_TITLE'
      : 'TICKETING_PUBLIC.EMPTY_NO_PACKAGES_TITLE'
  );
  emptyStateIcon = computed(() => (this.hasActiveFilters() ? 'search_off' : 'event_busy'));

  constructor() {
    effect(() => {
      if (!this.initialized) return;

      const queryParams = {
        q: this.searchQuery() || null,
        dow: this.selectedWeekday(),
        sort: this.sortOption() === 'price_asc' ? null : this.sortOption(),
        gen: this.showGeneral() ? null : 'f',
        day: this.showDaily() ? null : 'f',
        eve: this.showEvening() ? null : 'f'
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

  isSoldOut(pkg: Package): boolean {
    const quota = Number(pkg.quota ?? 0);
    const sold = Number(pkg.sold ?? 0);
    return quota > 0 && sold >= quota;
  }

  private packageIncludesWeekday(pkg: Package, weekday: number): boolean {
    const start = this.toDate(pkg.valid_at);
    const end = this.toDate(pkg.expired_at);
    if (!start || !end) {
      return false;
    }

    const startDay = new Date(start);
    const endDay = new Date(end);
    startDay.setHours(0, 0, 0, 0);
    endDay.setHours(0, 0, 0, 0);

    if (endDay < startDay) {
      return false;
    }

    const current = new Date(startDay);
    for (let i = 0; i <= 60 && current <= endDay; i += 1) {
      if (current.getDay() === weekday) {
        return true;
      }
      current.setDate(current.getDate() + 1);
    }

    return false;
  }

  private toDate(value: string | Date | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private parseInitialWeekday(value: unknown): number | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0 && parsed <= 6 ? parsed : null;
  }

  private parseInitialSort(value: unknown): PackageSort {
    const sort = String(value ?? '').trim();
    if (this.allowedSortOptions.includes(sort as PackageSort)) {
      return sort as PackageSort;
    }

    return 'price_asc';
  }
}
