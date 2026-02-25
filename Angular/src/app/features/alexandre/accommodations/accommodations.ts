import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { Observable, switchMap, map, of, forkJoin } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { TranslateModule } from '@ngx-translate/core';
import { AccommodationsService } from '@core/services/accommodations.service';
import { AccommodationWithImage } from '@core/models/accommodation';
import { AuthService } from '@core/services/auth.service';
import { UnitsService } from '@core/services/units.service';


@Component({
  selector: 'app-accommodations',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule,
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    TranslateModule,
  ],
  templateUrl: './accommodations.html',
  styleUrls: ['./accommodations.css']
})
export class Accommodations implements OnInit {
  accommodations$!: Observable<AccommodationWithImage[]>;
  currentCategory$!: Observable<string>; 

  private route = inject(ActivatedRoute);
  private service = inject(AccommodationsService);
  private authService = inject(AuthService);
  private unitsService = inject(UnitsService);

  ngOnInit() {
    this.currentCategory$ = this.route.queryParamMap.pipe(
      map(params => params.get('category') || 'all'),
      shareReplay(1)
    );

    this.accommodations$ = this.route.queryParamMap.pipe(
      switchMap(params => {
        const category = params.get('category') || 'all';
        return this.service.getAccommodations(category);
      }),
      switchMap(accs => {
        if (!accs || accs.length === 0) return of([]);

        const requests = accs.map(acc => 
          this.unitsService.getUnitsByAccommodation(acc.id).pipe(
            map(res => {
              const units = res.data || [];
              const urls: string[] = units.map(u => u.image_url).filter((url): url is string => !!url);
              
              const randomImg: string = urls.length > 0 
                ? urls[Math.floor(Math.random() * urls.length)] 
                : 'assets/placeholder-image.png';

              return { ...acc, displayImage: randomImg } as AccommodationWithImage;
            }),
            catchError(() => of({ ...acc, displayImage: 'assets/placeholder-image.png' } as AccommodationWithImage))
          )
        );

        return forkJoin(requests);
      }),
      shareReplay(1)
    );
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
