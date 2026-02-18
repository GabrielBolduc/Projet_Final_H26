import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs'; 
import { ReservationService } from '@core/services/reservation.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-reservations',
  standalone: true,
  templateUrl: './reservation.html',
  styleUrls: ['./reservation.css'],
  imports: [CommonModule, MatButtonModule, MatTabsModule, TranslateModule]
})
export class Reservation implements OnInit {
  private resService = inject(ReservationService);
  
  reservations = signal<any[]>([]);
  selectedRes = signal<any>(null);
  isLoading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    this.resService.getReservations().subscribe({
      next: (res: any) => {
        const data = res.data || [];
        this.reservations.set(data);
        if (data.length > 0) {
          this.selectedRes.set(data[0]);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  selectTab(index: number) {
    this.selectedRes.set(this.reservations()[index]);
  }

  onAdd() {}
  onModify() {} 
  onDelete() {
    if(confirm('Annuler cette réservation ?')) {
      this.resService.delete(this.selectedRes().id).subscribe(() => this.loadData());
    }
  }
}
