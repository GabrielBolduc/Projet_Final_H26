import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; 
import { MatIconModule } from '@angular/material/icon'; 
import { Observable, switchMap } from 'rxjs';
import { AccommodationsService } from '@core/services/accommodations.service';
import { Accommodation } from '@core/models/accommodation';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-accommodations',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatIconModule,
    RouterLink
  ],
  templateUrl: './accommodations.html',
  styleUrls: ['./accommodations.css']
})
export class Accommodations implements OnInit {
  accommodations$!: Observable<Accommodation[]>;

  private route = inject(ActivatedRoute);
  private service = inject(AccommodationsService);
  private authService = inject(AuthService);

  ngOnInit() {
    this.accommodations$ = this.route.queryParamMap.pipe(
      switchMap(params => {
        const category = params.get('category') || 'all';
        return this.service.getAccommodations(category);
      })
    );
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }
}
