import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, switchMap } from 'rxjs';
import { AccommodationsService } from '@core/services/accommodations.service';
import { Accommodation, AccommodationCategory } from '@core/models/accommodation';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-accommodations-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule
  ],
  templateUrl: './accommodations-details.html',
  styleUrl: './accommodations-details.css',
})
export class AccommodationsDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(AccommodationsService);
  private authService = inject(AuthService);

  accommodation$!: Observable<Accommodation>;
  Category = AccommodationCategory; 

  ngOnInit(): void {
    this.accommodation$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id'));
        return this.service.getAccommodation(id);
      })
    );
  }

  categoryNames: Record<number, string> = {
    [AccommodationCategory.Hotel]: 'Hotel',
    [AccommodationCategory.Camping]: 'Camping'
  };

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
