import { Component, computed, inject, resource, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
export class Ticketing {
  private auth = inject(AuthService);
  private packageService = inject(PackageService);

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

  isSoldOut(pkg: Package): boolean {
    const quota = Number(pkg.quota ?? 0);
    const sold = Number(pkg.sold ?? 0);
    return quota > 0 && sold >= quota;
  }
}
