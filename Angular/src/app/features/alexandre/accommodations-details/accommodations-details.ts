import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { switchMap, map } from 'rxjs';
import { AccommodationsService } from '@core/services/accommodations.service';
import { Accommodation, AccommodationCategory } from '@core/models/accommodation';
import { AuthService } from '@core/services/auth.service';
import { UnitsService } from '@core/services/units.service';
import { Unit, UnitType } from '@core/models/unit';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { signal, effect } from '@angular/core';

@Component({
  selector: 'app-accommodations-details',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatCardModule, MatIconModule,
    MatButtonModule, MatProgressSpinnerModule, TranslateModule
  ],
  templateUrl: './accommodations-details.html',
  styleUrl: './accommodations-details.css',
})
export class AccommodationsDetails {
  private route = inject(ActivatedRoute);
  private service = inject(AccommodationsService);
  private authService = inject(AuthService);
  private unitsService = inject(UnitsService);
  private sanitizer = inject(DomSanitizer);

  Category = AccommodationCategory;
  categoryNames: Record<number, string> = {
    [AccommodationCategory.Hotel]: 'Hotel',
    [AccommodationCategory.Camping]: 'Camping'
  };

  private id$ = this.route.paramMap.pipe(map(params => Number(params.get('id'))));
  private id = toSignal(this.id$, { initialValue: 0 });

  accommodation = toSignal(
    this.id$.pipe(switchMap(id => this.service.getAccommodation(id)))
  );

  units = toSignal(
    this.id$.pipe(
      switchMap(id => this.unitsService.getUnitsByAccommodation(id)),
      map(res => (res.data as Unit[]) || [])
    ),
    { initialValue: [] as Unit[] }
  );

  priceRange = computed(() => {
    const units = this.units();
    if (!units?.length) return null;
    const prices = units.map(u => Number(u.cost_person_per_night));
    return { min: Math.min(...prices), max: Math.max(...prices) };
  });

  images = computed(() => {
    const urls = this.units()
      .map(u => u.image_url)
      .filter((url): url is string => !!url);
    return urls.length > 0 ? [...new Set(urls)] : ['assets/placeholder-image.png'];
  });

  groupedUnits = computed(() => {
    const units = this.units();
    if (!units || units.length === 0) return [];

    const groups = units.reduce((acc, unit) => {
      const rawType = (unit.type as string) || '';
      const typeKey = rawType.replace('Units::', '') || 'Unknown';

      if (!acc[typeKey]) {
        acc[typeKey] = {
          type: typeKey,
          totalQuantity: 0,
          minPrice: Number(unit.cost_person_per_night) || 0,
          imageUrl: unit.image_url,
          icon: typeKey.toLowerCase().includes('room') ? 'hotel' : 'terrain',
          hasWifi: false,
          hasElectricity: false,
          waterStatus: 'no_water', 
          foodOptions: new Set<string>()
        };
      }

      acc[typeKey].totalQuantity += (unit.quantity || 0);
      if (unit.wifi) acc[typeKey].hasWifi = true;
      if (unit.electricity) acc[typeKey].hasElectricity = true;

      const statusPriority: Record<string, number> = { 'drinkable': 2, 'undrinkable': 1, 'no_water': 0 };
      const currentStatus = unit.water || 'no_water';
      const accStatus = acc[typeKey].waterStatus;
      
      if (statusPriority[currentStatus] > statusPriority[accStatus]) {
        acc[typeKey].waterStatus = currentStatus;
      }

      if (unit.food_options && Array.isArray(unit.food_options)) {
        unit.food_options.forEach(opt => {
          if (opt && opt !== 'None') acc[typeKey].foodOptions.add(opt);
        });
      }

      const price = Number(unit.cost_person_per_night) || 0;
      if (price < acc[typeKey].minPrice) acc[typeKey].minPrice = price;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(groups).map(group => ({
      ...group,
      foodOptions: Array.from(group.foodOptions as Set<string>)
    }));
  });


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
    return h > 0 ? `${h}h ${m}m` : `${m} min`;
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  mapUrl = computed(() => {
    // Use the accommodation signal from your details page
    const acc = this.accommodation();
    if (!acc || !acc.latitude || !acc.longitude) return null;

    const lat = Number(acc.latitude);
    const lng = Number(acc.longitude);
    const offset = 0.005; 

    // Fixed: used ${} for the math to execute and corrected the bbox/marker syntax
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - offset},${lat - offset},${lng + offset},${lat + offset}&layer=mapnik&marker=${lat},${lng}`;
    
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  
}
