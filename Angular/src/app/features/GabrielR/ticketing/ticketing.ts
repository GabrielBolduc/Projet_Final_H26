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

  private initialized = false;

  searchQuery = signal('');
  sortOption = signal<PackageSort>('price_asc');
  showGeneral = signal(true);
  showDaily = signal(true);
  showEvening = signal(true);

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
      status: 'ongoing',
      q: this.searchQuery(),
      sort: this.sortOption(),
      categories: this.selectedCategories()
    }),
    loader: ({ params }) => firstValueFrom(this.packageService.getPackages(params))
  });

  packages = computed(() => this.packagesResource.value() ?? []);
  isLoading = computed(() => this.packagesResource.isLoading());

  constructor() {
    effect(() => {
      if (!this.initialized) return;

      const queryParams = {
        q: this.searchQuery() || null,
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
    const params = this.route.snapshot.queryParams;
    
    if (params['q']) {
      this.searchQuery.set(params['q']);
    }
    
    if (params['sort']) {
      this.sortOption.set(params['sort'] as PackageSort);
    }
    
    if (params['gen'] === 'f') {
      this.showGeneral.set(false);
    }
    
    if (params['day'] === 'f') {
      this.showDaily.set(false);
    }
    
    if (params['eve'] === 'f') {
      this.showEvening.set(false);
    }

    this.initialized = true;
  }

  isSoldOut(pkg: Package): boolean {
    const quota = Number(pkg.quota ?? 0);
    const sold = Number(pkg.sold ?? 0);
    return quota > 0 && sold >= quota;
  }
}
