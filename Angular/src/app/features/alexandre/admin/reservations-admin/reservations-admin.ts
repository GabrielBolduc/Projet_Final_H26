import { Component, AfterViewInit, inject, ViewChild, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslateModule } from '@ngx-translate/core';
import { MatSelectModule } from '@angular/material/select'; 

import { ReservationsService } from '@core/services/reservation.service';
import { Reservation } from '@core/models/reservation';

@Component({
  selector: 'app-reservations-admin',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule,
    MatInputModule, MatFormFieldModule, MatIconModule, TranslateModule,
    MatAutocompleteModule, MatSelectModule
  ],
  templateUrl: './reservations-admin.html',
  styleUrl: './reservations-admin.css',
})
export class ReservationsAdmin implements AfterViewInit {
  private reservationsService = inject(ReservationsService);

  reservations = signal<Reservation[]>([]);
  totalRecords = signal<number>(0);
  isLoading = signal<boolean>(true);
  searchTerm = signal<string>('');
  statusFilter = signal<string>('all'); 

  private accommodationNames = computed(() => {
    const names = this.reservations()
      .map(r => r.unit?.accommodation?.name)
      .filter((n): n is string => !!n);
    return [...new Set(names)];
  });

  filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    
    return this.accommodationNames()
      .filter(name => name.toLowerCase().includes(term))
      .sort((a, b) => a.localeCompare(b)) 
      .slice(0, 5);                
  });

  displayedColumns: string[] = [
    'reservation_name', 'phone_number', 'accommodation', 
    'unit_type', 'arrival_at', 'departure_at', 'nb_of_people', 'status'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    effect(() => {
      this.searchTerm();
      this.statusFilter();
      untracked(() => this.loadData());
    });
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.loadData();
    });

    this.paginator.page.subscribe(() => {
      this.loadData();
    });

    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    const params = {
      admin_view: true,
      page: (this.paginator?.pageIndex ?? 0) + 1,
      per_page: this.paginator?.pageSize ?? 10,
      sort_by: this.sort?.active || 'created_at',
      order: this.sort?.direction || 'desc',
      search: this.searchTerm(),
      status_filter: this.statusFilter()
    };

    this.reservationsService.list(params).subscribe({
      next: (res: any) => {
        this.reservations.set(res.data);
        this.totalRecords.set(res.total);
        this.isLoading.set(false);
      }
    });
  }

  updateSearch(value: string): void {
    this.searchTerm.set(value);
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  getReservationStatus(row: Reservation): string {
    if (row.status === 'cancelled') return 'Cancelled';
    return (row as any).festival?.status === 'completed' ? 'Archived' : 'Active';
  }

  getUnitTypeName(type: string | undefined): string {
    if (!type) return '';
    const parts = type.split('::');
    return parts[parts.length - 1];
  }
}
