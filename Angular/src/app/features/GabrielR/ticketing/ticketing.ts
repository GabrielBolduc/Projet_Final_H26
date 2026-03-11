import { Component, OnInit, computed, effect, inject, resource, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
  private queryParams = toSignal(this.route.queryParams, { initialValue: this.route.snapshot.queryParams });
  private readonly allowedSortOptions: PackageSort[] = [ 'price_asc', 'price_desc', 'date_asc', 'date_desc' ];

  private initialized = signal(false);
  readonly weekdayOptions = [
    { value: 0, labelKey: 'TICKETING_PUBLIC.DAY_SUNDAY' },
    { value: 1, labelKey: 'TICKETING_PUBLIC.DAY_MONDAY' },
    { value: 2, labelKey: 'TICKETING_PUBLIC.DAY_TUESDAY' },
    { value: 3, labelKey: 'TICKETING_PUBLIC.DAY_WEDNESDAY' },
    { value: 4, labelKey: 'TICKETING_PUBLIC.DAY_THURSDAY' },
    { value: 5, labelKey: 'TICKETING_PUBLIC.DAY_FRIDAY' },
    { value: 6, labelKey: 'TICKETING_PUBLIC.DAY_SATURDAY' }
  ];

  searchQuery = signal(this.initialQueryParams['q'] || '');
  selectedWeekdays = signal<number[]>(this.parseInitialWeekdays(this.initialQueryParams['dow']));
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
    params: () => {
      const query = this.searchQuery().trim();
      return {
        q: query ? query : undefined,
        dow: this.selectedWeekdays().length > 0 ? this.selectedWeekdays().join(',') : undefined,
        sort: this.sortOption(),
        categories: this.selectedCategories()
      };
    },
    loader: ({ params }) => firstValueFrom(this.packageService.getPackages(params))
  });

  packages = computed(() => this.packagesResource.value() ?? []);
  filteredPackages = computed(() => this.packages());

  isLoading = computed(() => this.packagesResource.isLoading());
  hasActiveFilters = computed(() =>
    this.searchQuery().trim() !== '' ||
    this.selectedWeekdays().length > 0 || 
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
      const initialized = this.initialized();
      if (!initialized) return;

      const queryParams = {
        q: this.searchQuery() || null,
        dow: this.selectedWeekdays().length > 0 ? this.selectedWeekdays().join(',') : null,
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

    effect(() => {
      const initialized = this.initialized();
      if (!initialized) return;

      const params = this.queryParams();
      untracked(() => {
        const nextSearch = String(params['q'] ?? '');
        if (this.searchQuery() !== nextSearch) {
          this.searchQuery.set(nextSearch);
        }

        const nextWeekdays = this.parseInitialWeekdays(params['dow']);
        if (!this.areWeekdaysEqual(this.selectedWeekdays(), nextWeekdays)) {
          this.selectedWeekdays.set(nextWeekdays);
        }

        const nextSort = this.parseInitialSort(params['sort']);
        if (this.sortOption() !== nextSort) {
          this.sortOption.set(nextSort);
        }

        const nextGeneral = params['gen'] !== 'f';
        if (this.showGeneral() !== nextGeneral) {
          this.showGeneral.set(nextGeneral);
        }

        const nextDaily = params['day'] !== 'f';
        if (this.showDaily() !== nextDaily) {
          this.showDaily.set(nextDaily);
        }

        const nextEvening = params['eve'] !== 'f';
        if (this.showEvening() !== nextEvening) {
          this.showEvening.set(nextEvening);
        }
      });
    });
  }

  ngOnInit(): void {
    this.initialized.set(true);
  }

  isSoldOut(pkg: Package): boolean {
    const quota = Number(pkg.quota ?? 0);
    const sold = Number(pkg.sold ?? 0);
    return quota > 0 && sold >= quota;
  }

  hasDiscount(pkg: Package): boolean {
    const minQty = Number(pkg.discount_min_quantity ?? 0);
    const rate = Number(pkg.discount_rate ?? 0);
    return minQty > 0 && rate > 0;
  }

  formatDiscount(pkg: Package): string {
    const rate = Number(pkg.discount_rate ?? 0);
    return `${Math.round(rate * 100)}%`;
  }

  getWeekdayLabel(value: number): string {
    return this.weekdayOptions.find(option => option.value === value)?.labelKey ?? '';
  }

  private parseInitialWeekdays(value: unknown): number[] {
    if (value === undefined || value === null || value === '') {
      return [];
    }

    const raw = Array.isArray(value) ? value.join(',') : String(value);
    const parsed = raw
      .split(',')
      .map(entry => Number(entry))
      .filter(day => Number.isInteger(day) && day >= 0 && day <= 6);

    return Array.from(new Set(parsed));
  }

  private areWeekdaysEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    return sortedA.every((day, index) => day === sortedB[index]);
  }

  private parseInitialSort(value: unknown): PackageSort {
    const sort = String(value ?? '').trim();
    if (this.allowedSortOptions.includes(sort as PackageSort)) {
      return sort as PackageSort;
    }

    return 'price_asc';
  }
}
