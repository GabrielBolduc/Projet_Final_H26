import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { FestivalStatsService } from '../../../../app/core/services/festival-stats.service';

export interface FestivalStatRow {
  id: number;
  name: string;
  year: number;
  artist_count: number;
  performance_count: number;
  top_stage_name: string;
  top_stage_perf_count: number;
  top_stage_avg_pop: number;
  top_stage_env: string;
}

@Component({
  selector: 'app-stats-festival',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatIconModule, 
    MatProgressSpinnerModule
  ],
  templateUrl: './festival.html',
  styleUrls: ['./festival.css']
})
export class FestivalComponent implements OnInit {
  private festivalService = inject(FestivalStatsService);

  isLoading = signal(true);
  stats = signal<FestivalStatRow[]>([]);

  displayedColumns: string[] = [
    'name', 
    'artist_count', 
    'performance_count', 
    'top_stage_name', 
    'top_stage_perf_count', 
    'top_stage_avg_pop',
    'top_stage_env'
  ];

  ngOnInit(): void {
    this.loadStats();
  }

  async loadStats() {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.festivalService.getFestivalStats());
      this.stats.set(data);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques", error);
    } finally {
      this.isLoading.set(false);
    }
  }
}