import { Component, inject, signal, computed, effect, input } from '@angular/core';
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
export class FestivalComponent {
  private statsService = inject(FestivalStatsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  year = input<string>();
  festivals = input<string>();
  isLoading = signal(true);
  isFiltering = signal(false);
  globalStats = signal<GlobalStats | null>(null);
  
  statsList = signal<FestivalStatRow[]>([]); 
  availableYears = signal<number[]>([]);
  availableFestivals = signal<{id: number, name: string}[]>([]);

  displayedColumns: string[] = [
    'name', 'artist_count', 'performance_count', 'top_stage_name', 
    'top_stage_perf_count', 'top_stage_avg_pop', 'top_stage_env'
  ];

  parsedYear = computed(() => this.year() ? Number(this.year()) : null);
  parsedFestivals = computed(() => this.festivals() ? this.festivals()!.split(',').map(Number) : []);

  constructor() {
    this.loadDropdownOptions();

    effect(async () => {
      const y = this.parsedYear();
      const f = this.parsedFestivals();

      this.isFiltering.set(true);

      try {
        const params: any = {};
        if (y) params.year = y;
        if (f && f.length > 0) params.festival_ids = f;
        const data = await firstValueFrom(this.statsService.getFestivalStats(params)) as FestivalStatsResponse;
        this.globalStats.set(data.global);
        this.statsList.set(data.list);
      } catch (error) {
        console.error("Erreur HTTP lors du filtrage", error);
      } finally {
        this.isFiltering.set(false);
        this.isLoading.set(false);
      }
    });
  }

  async loadDropdownOptions() {
    try {
      const data = await firstValueFrom(this.statsService.getFestivalStats()) as FestivalStatsResponse;
      
      const years = [...new Set(data.list.map(s => s.year))].sort((a, b) => b - a);
      this.availableYears.set(years);
      
      this.availableFestivals.set(data.list.map(s => ({ id: s.id, name: s.name })));
    } catch (error) {
      console.error("Erreur lors du chargement des options", error);
    }
  }

  updateYear(val: number | null) {
    this.router.navigate([], { 
      relativeTo: this.route, 
      queryParams: { year: val || null }, 
      queryParamsHandling: 'merge', 
      replaceUrl: true 
    });
  }

  updateFestivals(val: number[]) {
    this.router.navigate([], { 
      relativeTo: this.route, 
      queryParams: { festivals: val && val.length > 0 ? val.join(',') : null }, 
      queryParamsHandling: 'merge', 
      replaceUrl: true 
    });
  }
}