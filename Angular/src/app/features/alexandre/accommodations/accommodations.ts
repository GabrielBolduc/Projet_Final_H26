import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { MatCardModule } from '@angular/material/card'; 
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { Observable, switchMap, map } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
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
    MatButtonModule,
    RouterLink,
    RouterLinkActive,
    TranslateModule,
  ],
  templateUrl: './accommodations.html',
  styleUrls: ['./accommodations.css']
})
export class Accommodations implements OnInit {
  accommodations$!: Observable<Accommodation[]>;
  currentCategory$!: Observable<string>; 

  private route = inject(ActivatedRoute);
  private service = inject(AccommodationsService);
  private authService = inject(AuthService);

  ngOnInit() {

    this.currentCategory$ = this.route.queryParamMap.pipe(
      map(params => params.get('category') || 'all')
    );

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
