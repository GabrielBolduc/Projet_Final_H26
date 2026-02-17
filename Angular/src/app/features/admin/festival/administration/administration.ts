import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { FestivalService } from '../../../../core/services/festival.service';
import { Festival } from '../../../../core/models/festival';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [CommonModule, DatePipe, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './administration.html',
  styleUrls: ['./administration.css']
})
export class AdministrationComponent implements OnInit {
  private festivalService = inject(FestivalService);
  
  festivals = signal<Festival[]>([]);

  currentFestival = computed(() => 
    this.festivals().find(f => f.status === 'draft' || f.status === 'ongoing')
  );

  archives = computed(() => 
    this.festivals().filter(f => f.status === 'completed')
  );

  ngOnInit(): void {
    this.festivalService.getFestivals().subscribe(data => this.festivals.set(data));
  }
}