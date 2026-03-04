import { Component, OnInit, inject, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { ReservationsService } from '@core/services/reservation.service';
import { Reservation } from '@core/models/reservation';

@Component({
  selector: 'app-reservations-admin',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatInputModule, MatFormFieldModule, MatIconModule, TranslateModule
  ],
  templateUrl: './reservations-admin.html',
  styleUrl: './reservations-admin.css',
})
export class ReservationsAdmin implements OnInit {
  private reservationsService = inject(ReservationsService);

  dataSource = new MatTableDataSource<Reservation>([]);
  displayedColumns: string[] = [
    'reservation_name', 
    'accommodation',
    'unit_type',
    'arrival_at', 
    'departure_at', 
    'nb_of_people', 
    'status'
  ];  
  isLoading = signal<boolean>(true);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadAllReservations();
  }

  loadAllReservations(): void {
    this.isLoading.set(true);
    this.reservationsService.list().subscribe({
      next: (res) => {
        this.dataSource.data = res.data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.dataSource.filterPredicate = (data: Reservation, filter: string) => {
          const accommodationName = data.unit?.accommodation?.name?.toLowerCase() || '';
          return accommodationName.includes(filter);
        };
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getReservationStatus(row: Reservation): 'Active' | 'Cancelled' | 'Archived' {
    if (row.status === 'cancelled') return 'Cancelled';
    
    const festivalStatus = (row as any).festival?.status;
    if (festivalStatus === 'completed') return 'Archived';
    
    return 'Active';
  }
}
