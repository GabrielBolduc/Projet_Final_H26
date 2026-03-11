import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card'; 
import { TranslateModule } from '@ngx-translate/core'; 
import { firstValueFrom } from 'rxjs';

import { FestivalStatsService } from '../../../../app/core/services/festival-stats.service';

export interface GlobalStats {
  total_festivals: number;
  avg_satisfaction: number;
  total_artists: number;
  genres_repartition: { name: string; percent: number }[];
}

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

export interface FestivalStatsResponse {
  global: GlobalStats;
  list: FestivalStatRow[];
}

@Component({
  selector: 'app-stats-festival',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule, TranslateModule,
    MatTableModule, MatIconModule, MatProgressSpinnerModule,
    MatFormFieldModule, MatSelectModule, MatCardModule
  ],
  templateUrl: './festival.html',
  styleUrls: ['./festival.css']
})
export class FestivalComponent implements OnInit {
  private statsService = inject(FestivalStatsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isLoading = signal(true);
  globalStats = signal<GlobalStats | null>(null);
  rawStats = signal<FestivalStatRow[]>([]); 
  
  filterYear = signal<number | null>(null);
  filterFestivals = signal<number[]>([]);
  
  private initialized = false;

  displayedColumns: string[] = [
    'name', 'artist_count', 'performance_count', 'top_stage_name', 
    'top_stage_perf_count', 'top_stage_avg_pop', 'top_stage_env'
  ];

  availableYears = computed(() => {
    const years = this.rawStats().map(s => s.year);
    return [...new Set(years)].sort((a, b) => b - a);
  });

  filteredStats = computed(() => {
    let data = [...this.rawStats()];
    const year = this.filterYear();
    const fests = this.filterFestivals();

    if (year) {
      data = data.filter(f => f.year === year);
    }

    if (fests && fests.length > 0) {
      data = data.filter(f => fests.includes(f.id));
    }

    return data;
  });

  constructor() {
    effect(() => {
      if (!this.initialized) return;
      
      const queryParams = {
        year: this.filterYear() || null,
        festivals: this.filterFestivals().length > 0 ? this.filterFestivals().join(',') : null
      };

      this.router.navigate([], { 
        relativeTo: this.route, 
        queryParams, 
        queryParamsHandling: 'merge', 
        replaceUrl: true 
      });
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    
    if (params['year']) {
      this.filterYear.set(Number(params['year']));
    }
    
    if (params['festivals']) {
      this.filterFestivals.set(params['festivals'].split(',').map(Number));
    }

    this.initialized = true;
    this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.statsService.getFestivalStats()) as FestivalStatsResponse;
      
      this.globalStats.set(data.global);
      this.rawStats.set(data.list);
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques", error);
    } finally {
      this.isLoading.set(false);
    }
  }

  updateYear(val: number | null) {
    this.filterYear.set(val);
  }

  updateFestivals(val: number[]) {
    this.filterFestivals.set(val);
  }
}