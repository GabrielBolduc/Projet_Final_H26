import { Component, OnInit, inject, signal, ChangeDetectorRef, computed, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip'; 
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, take } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

import { ReservationsService } from '@core/services/reservation.service';
import { Reservation } from '@core/models/reservation';
import { ApiResponse } from '@core/models/api-response';
import { AuthService } from '@core/services/auth.service';

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
    MatDialogModule,
    TranslateModule,
    MatTooltipModule
  ],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css',
})
export class Reservations implements OnInit {
  private reservationsService = inject(ReservationsService);
  public authService = inject(AuthService);
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);

  activeReservationsList = signal<Reservation[]>([]); 
  selectedReservation = signal<Reservation | null>(null);
  historyReservations = signal<Reservation[]>([]);

  showHistory = signal<boolean>(false);
  isLoading = signal<boolean>(true);

  filteredHistory = computed(() => {
    return this.historyReservations().filter(res => res.status !== 'active');
  });

  mapUrl = computed(() => {
    const res = this.selectedReservation();
    const acc = res?.unit?.accommodation;
    
    if (!acc || !acc.latitude || !acc.longitude) return null;

    const lat = Number(acc.latitude);
    const lng = Number(acc.longitude);
    const offset = 0.005; 
    
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - offset},${lat - offset},${lng + offset},${lat + offset}&layer=mapnik&marker=${lat},${lng}`;    
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

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

    const active$ = this.reservationsService.list({ history: false }).pipe(
      take(1),
      catchError(() => of(fallback))
    );

    const history$ = this.reservationsService.list({ history: true }).pipe(
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
          this.activeReservationsList.set(activeList);
      
          const currentId = this.selectedReservation()?.id;
          const stillExists = activeList.find((r: Reservation) => r.id === currentId);
          
          if (stillExists) {
            this.selectedReservation.set(stillExists);
          } else {
            this.selectedReservation.set(activeList.length > 0 ? activeList[0] : null);
          }
          
          this.historyReservations.set(results.history?.data || []);
        },
        error: (err) => {
          console.error("Critical error in refreshData", err);
          this.isLoading.set(false);
        }
      });
  }

  selectReservation(res: Reservation): void {
    this.showHistory.set(false);
    this.selectedReservation.set(res);
    this.cdr.detectChanges();
  }

  toggleHistoryView(): void {
    this.showHistory.update(v => !v);
    this.cdr.detectChanges();
  }

  formatDate(date: string | Date): Date {
    return new Date(date);
  }

  getUnitTypeName(type: string | undefined): string {
    if (!type) return '';
    const parts = type.split('::');
    return parts[parts.length - 1];
  }

  openCancelDialog(templateRef: TemplateRef<any>): void {
    const dialogRef = this.dialog.open(templateRef, {
      width: '400px',
      panelClass: 'brutalist-dialog'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.executeCancel();
      }
    });
  }

  private executeCancel(): void {
    const current = this.selectedReservation();
    if (!current?.id) return;

    this.isLoading.set(true);
    this.reservationsService.delete(current.id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {

        this.selectedReservation.set(null); 
        this.refreshData(); 
      },
      error: (err) => alert(err.message || 'Error cancelling reservation')
    });
  }

  calculateNights(arrival: string | Date, departure: string | Date): number {
    const start = new Date(arrival);
    const end = new Date(departure);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }
}
