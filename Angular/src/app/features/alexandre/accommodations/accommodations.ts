import { Component, inject, computed, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, of, tap } from 'rxjs'; 
import { catchError } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';

import { AccommodationsService } from '@core/services/accommodations.service';
import { AccommodationWithImage, SSFFilters } from '@core/models/accommodation';
import { UnitType } from '@core/models/unit';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-accommodations',
  standalone: true,
  imports: [
    CommonModule, RouterLink, RouterLinkActive, TranslateModule,
    MatCardModule, MatIconModule, MatButtonModule, MatMenuModule,
    MatDividerModule, MatProgressSpinnerModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatSliderModule, MatChipsModule
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

  currentCategory = computed(() => this.queryParams()?.get('category') || 'all');
  searchValue = computed(() => this.queryParams()?.get('name') || '');
  maxDistanceValue = computed(() => Number(this.queryParams()?.get('max_distance') || 25));
  maxPriceValue = computed(() => Number(this.queryParams()?.get('max_price') || 500));
  wifiValue = computed(() => this.queryParams()?.get('wifi') === 'true');
  electricityValue = computed(() => this.queryParams()?.get('electricity') === 'true');
  waterValue = computed(() => this.queryParams()?.get('water') || '');
  unitTypeValue = computed(() => this.queryParams()?.get('type') || '');
  isCamping = computed(() => this.currentCategory() === 'camping');
  
  availableUnitTypes = computed(() => {
    const category = this.currentCategory();
    const allTypes = Object.values(UnitType);
    
    if (category === 'hotel') return allTypes.filter(t => t.includes('Room'));
    if (category === 'camping') return allTypes.filter(t => t.includes('Terrain'));
    return allTypes;
  });

  private accommodations$ = this.route.queryParamMap.pipe(
    tap(() => this.isLoading.set(true)),
    switchMap(params => {
      const filters: SSFFilters = {
        category: (params.get('category') as any) || 'all',
        name: params.get('name') || undefined,
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
    map(accs => accs.map(acc => {
      const urls = (acc.units || []).map(u => u.image_url).filter((url): url is string => !!url);
      const displayImage = urls.length > 0 
        ? urls[Math.floor(Math.random() * urls.length)] 
        : 'assets/placeholder-image.png';

      return { ...acc, displayImage } as AccommodationWithImage;
    })),
    tap(() => this.isLoading.set(false))
  );

  accommodations = toSignal(this.accommodations$, { initialValue: [] as AccommodationWithImage[] });

  updateFilter(key: string, value: any) {
    const extras: any = { [key]: value };
    if (key === 'category') {
      extras['type'] = null;
      extras['name'] = null;
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
