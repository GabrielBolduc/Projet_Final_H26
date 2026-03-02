import { Component, inject, computed, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { switchMap, map, of, tap } from 'rxjs'; 
import { catchError } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';

import { AccommodationsService } from '@core/services/accommodations.service';
import { AccommodationWithImage, SSFFilters } from '@core/models/accommodation';
import { UnitType } from '@core/models/unit';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-accommodations',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    RouterLink, RouterLinkActive, TranslateModule, MatMenuModule,
    MatDividerModule, MatProgressSpinnerModule
  ],
  templateUrl: './accommodations.html',
  styleUrls: ['./accommodations.css']
})
export class Accommodations {
  private route = inject(ActivatedRoute);
  private service = inject(AccommodationsService);
  private authService = inject(AuthService);
  private router = inject(Router);

  private queryParams = toSignal(this.route.queryParamMap);
  isLoading = signal(false);

  // --- SIGNALS FOR UI STATE ---
  currentCategory = computed(() => this.queryParams()?.get('category') || 'all');
  maxDistanceValue = computed(() => this.queryParams()?.get('max_distance') || '25');
  maxPriceValue = computed(() => this.queryParams()?.get('max_price') || '500');
  wifiValue = computed(() => this.queryParams()?.get('wifi') === 'true');
  electricityValue = computed(() => this.queryParams()?.get('electricity') === 'true');
  waterValue = computed(() => this.queryParams()?.get('water') || '');
  unitTypeValue = computed(() => this.queryParams()?.get('type') || '');
  isCamping = computed(() => this.currentCategory() === 'camping');

  /**
   * ADAPTIVE FILTERS: Returns only relevant UnitTypes based on selected category.
   */
  availableUnitTypes = computed(() => {
    const category = this.currentCategory();
    const allTypes = Object.values(UnitType);
    
    if (category === 'hotel') {
      return allTypes.filter(t => t.includes('Room'));
    } else if (category === 'camping') {
      return allTypes.filter(t => t.includes('Terrain'));
    }
    return allTypes;
  });

  private accommodations$ = this.route.queryParamMap.pipe(
    tap(() => this.isLoading.set(true)),
    switchMap(params => {
      const filters: SSFFilters = {
        category: (params.get('category') as any) || 'all',
        max_distance: params.get('max_distance') ? Number(params.get('max_distance')) : undefined,
        wifi: params.get('wifi') === 'true' ? true : undefined,
        electricity: params.get('electricity') === 'true' ? true : undefined,
        water: params.get('water') || undefined,
        max_price: params.get('max_price') ? Number(params.get('max_price')) : undefined,
        type: params.get('type') || undefined
      };

      return this.service.getAccommodations(filters).pipe(
        catchError((err) => {
          console.error('SSF Error:', err);
          return of([]);
        })
      );
    }),
    map(accs => {
      return accs.map(acc => {
        const units = acc.units || [];
        const urls = units.map(u => u.image_url).filter((url): url is string => !!url);
        const displayImage = urls.length > 0 
          ? urls[Math.floor(Math.random() * urls.length)] 
          : 'assets/placeholder-image.png';

        return { ...acc, displayImage } as AccommodationWithImage;
      });
    }),
    tap(() => this.isLoading.set(false))
  );

  accommodations = toSignal(this.accommodations$, { initialValue: [] as AccommodationWithImage[] });

  /**
   * Updates URL params. 
   * If switching 'category', it automatically clears 'type' to prevent cross-category errors.
   */
  updateFilter(key: string, value: any) {
    const extras: any = { [key]: value };
    
    // Auto-reset room type if changing top-level category
    if (key === 'category') {
      extras['type'] = null;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: extras,
      queryParamsHandling: 'merge'
    });
  }

  resetFilters() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { category: this.currentCategory() }
    });
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
