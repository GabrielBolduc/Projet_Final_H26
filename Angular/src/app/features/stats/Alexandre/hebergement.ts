import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { AccommodationsStatsService } from '@core/services/accommodations-stats.service';
import { AccommodationStatsResponse } from '@core/models/accommodation';
import { Observable, catchError, of, tap, finalize } from 'rxjs';

@Component({
  selector: 'app-hebergement',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    TranslateModule, 
    MatIconModule, 
    MatTabsModule, 
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule
  ],
  templateUrl: './hebergement.html',
  styleUrls: ['./hebergement.css']
})
export class HebergementComponent implements OnInit {
  public translate = inject(TranslateService);
  private statsService = inject(AccommodationsStatsService);

  public stats$!: Observable<AccommodationStatsResponse | null>;
  
  public loading = true;
  public error = false;
  public displayedColumns: string[] = ['name', 'revenue', 'profit', 'distance', 'services', 'inventory'];

  ngOnInit(): void {
    this.fetchStats();
  }

  fetchStats(): void {
    this.loading = true;
    this.error = false;

    this.stats$ = this.statsService.getStats().pipe(
      tap(() => {
        this.loading = false;
        this.error = false;
      }),
      catchError((err) => {
        console.error('Stats load failed', err);
        this.error = true;
        this.loading = false;
        return of(null);
      })
    );
  }

  returnZero() {
    return 0;
  }
}
