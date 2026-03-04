import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';

import { ReservationsService } from '@core/services/reservation.service';
import { Reservation } from '@core/models/reservation';
import { ApiResponse } from '@core/models/api-response';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    TranslateModule
  ],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations implements OnInit {
  private reservationsService = inject(ReservationsService);
  private cdr = inject(ChangeDetectorRef);

  activeReservation = signal<Reservation | null>(null);
  historyReservations = signal<Reservation[]>([]);
  showHistory = signal<boolean>(false);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.refreshData();
  }
  refreshData(): void {
    this.isLoading.set(true);

    const fallback: ApiResponse<Reservation[]> = { 
      status: 'success', 
      data: [], 
      errors: {} 
    };

    const active$ = this.reservationsService.list({ history: false } as any).pipe(
      take(1),
      catchError(() => of(fallback))
    );

    const history$ = this.reservationsService.list({ history: true } as any).pipe(
      take(1),
      catchError(() => of(fallback))
    );

    forkJoin({ active: active$, history: history$ })
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (results: any) => {
          const activeList = results.active?.data || [];

          this.activeReservation.set(activeList.length > 0 ? activeList[0] : null);
          
          this.historyReservations.set(results.history?.data || []);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error("Critical error in refreshData", err);
          this.activeReservation.set(null);
          this.historyReservations.set([]);
          this.cdr.detectChanges();
        }
      });
  }

  toggleHistoryView(): void {
    this.showHistory.update(v => !v);
    this.cdr.detectChanges();
  }

  onCancel(): void {
    const current = this.activeReservation();
    if (!current?.id) return;

    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.reservationsService.delete(current.id).subscribe({
        next: () => {
          this.activeReservation.set(null);
          this.refreshData();
        },
        error: (err) => alert(err.message || 'Error cancelling reservation')
      });
    }
  }

  formatDate(date: string | Date): Date {
    return new Date(date);
  }
}
