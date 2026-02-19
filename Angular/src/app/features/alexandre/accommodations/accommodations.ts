import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ActivatedRoute, RouterLink } from '@angular/router'; // Import RouterLink
import { MatCardModule } from '@angular/material/card'; 
import { MatButtonModule } from '@angular/material/button';
import { Observable, switchMap, map } from 'rxjs';
import { AccommodationsService } from '@core/services/accommodations.service';

@Component({
  selector: 'app-accommodations',
  standalone: true,
  imports: [
    CommonModule, 
    MatCardModule, 
    MatButtonModule, 
    RouterLink
  ],
  templateUrl: './accommodations.html',
  styleUrls: ['./accommodations.css']
})
export class Accommodations implements OnInit {
  accommodations$!: Observable<any[]>;

  constructor(
    private route: ActivatedRoute,
    private service: AccommodationsService
  ) {}

  ngOnInit() {
    this.accommodations$ = this.route.queryParamMap.pipe(
      switchMap(params => {
        const category = params.get('category') || 'all';
        return this.service.getAccommodations(category);
      }),
      map((res: any) => res.data)
    );
  }
}