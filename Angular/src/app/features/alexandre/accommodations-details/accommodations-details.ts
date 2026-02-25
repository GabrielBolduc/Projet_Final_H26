import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, switchMap, map, shareReplay } from 'rxjs';
import { AccommodationsService } from '@core/services/accommodations.service';
import { Accommodation, AccommodationCategory } from '@core/models/accommodation';
import { AuthService } from '@core/services/auth.service';
import { UnitsService } from '@core/services/units.service';
import { Unit, UnitType } from '@core/models/unit';

@Component({
  selector: 'app-accommodations-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './accommodations-details.html',
  styleUrl: './accommodations-details.css',
})
export class AccommodationsDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(AccommodationsService);
  private authService = inject(AuthService);
  private unitsService = inject(UnitsService);

  accommodation$!: Observable<Accommodation>;
  units$!: Observable<Unit[]>;
  priceRange$!: Observable<{ min: number; max: number } | null>;
  groupedUnits$!: Observable<any[]>;
  images$!: Observable<string[]>;
  
  Category = AccommodationCategory;

  categoryNames: Record<number, string> = {
    [AccommodationCategory.Hotel]: 'Hotel',
    [AccommodationCategory.Camping]: 'Camping'
  };

  ngOnInit(): void {
    const id$ = this.route.paramMap.pipe(
      map(params => Number(params.get('id'))),
      shareReplay(1)
    );

    // Fetch Accommodation Details
    this.accommodation$ = id$.pipe(
      switchMap(id => this.service.getAccommodation(id))
    );

    // Fetch Units from Backend
    this.units$ = id$.pipe(
      switchMap(id => this.unitsService.getUnitsByAccommodation(id)),
      map(res => (res.data as Unit[]) || []),
      shareReplay(1)
    );

    // Process Unit Groups for UI (Images + Counts)
this.groupedUnits$ = this.units$.pipe(
  map(units => {
    const groups = units.reduce((acc, unit) => {
      const typeKey = (unit.type as string).replace('Units::', '') as UnitType;

      if (!acc[typeKey]) {
        acc[typeKey] = {
          type: typeKey,
          totalQuantity: 0,
          minPrice: Number(unit.cost_person_per_night),
          imageUrl: unit.image_url,
          icon: typeKey.toLowerCase().includes('room') ? 'hotel' : 'terrain',
          hasWifi: false,
          hasElectricity: false,
          waterStatus: 'no_water', // Track the enum string
          foodOptions: new Set<string>()
        };
      }

      acc[typeKey].totalQuantity += unit.quantity;
      if (unit.wifi) acc[typeKey].hasWifi = true;
      if (unit.electricity) acc[typeKey].hasElectricity = true;

      // Logic to prioritize "drinkable" > "undrinkable" > "no_water"
      const statusPriority: Record<string, number> = { 'drinkable': 2, 'undrinkable': 1, 'no_water': 0 };
      const currentStatus = unit.water || 'no_water';
      if (statusPriority[currentStatus] > statusPriority[acc[typeKey].waterStatus]) {
        acc[typeKey].waterStatus = currentStatus;
      }

      if (unit.food_options) {
        unit.food_options.forEach(opt => {
          if (opt && opt !== 'None') acc[typeKey].foodOptions.add(opt);
        });
      }

      const price = Number(unit.cost_person_per_night);
      if (price < acc[typeKey].minPrice) acc[typeKey].minPrice = price;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(groups).map(group => ({
      ...group,
      foodOptions: Array.from(group.foodOptions)
    }));
  })
);

    // Calculate Overall Price Range
    this.priceRange$ = this.units$.pipe(
      map(units => {
        if (!units?.length) return null;
        const prices = units.map(u => Number(u.cost_person_per_night));
        return { 
          min: Math.min(...prices), 
          max: Math.max(...prices) 
        };
      })
    );

    this.images$ = this.units$.pipe(
      map(units => {
        const urls = units
          .map(u => u.image_url)
          .filter((url): url is string => !!url);
        
        // Return unique images or the default placeholder if none exist
        return urls.length > 0 ? [...new Set(urls)] : ['assets/placeholder-image.png'];
      }),
      shareReplay(1)
    );
  }

  scrollGallery(viewer: HTMLElement, direction: 'left' | 'right'): void {
    const scrollAmount = viewer.clientWidth;
    viewer.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }

  formatTime(timeString: any): string {
    if (!timeString) return '';
    const timeMatch = String(timeString).match(/(\d{2}):(\d{2}):(\d{2})/);
    
    if (!timeMatch) return timeString;

    const h = parseInt(timeMatch[1], 10);
    const m = parseInt(timeMatch[2], 10);

    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m} min`;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
