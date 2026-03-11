import { Component, inject, OnInit, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AccommodationsStatsService } from '@core/services/accommodations-stats.service';
import { AccommodationStatsResponse } from '@core/models/accommodation';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-hebergement',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, MatIconModule, 
    MatTableModule, MatProgressSpinnerModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCardModule, FormsModule, ReactiveFormsModule, MatAutocompleteModule 
  ],
  templateUrl: './hebergement.html',
  styleUrls: ['./hebergement.css']
})
export class HebergementComponent implements OnInit {
  private statsService = inject(AccommodationsStatsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public rawStats = signal<AccommodationStatsResponse | null>(null);
  public availableFestivals = signal<{id: number, name: string}[]>([]);
  public loading = signal(true);
  public error = signal(false);

  public searchTerm = signal<string>('');
  public sortBy = signal<string>('date');
  public festivalIds = signal<number[]>([]);
  public dateAfter = signal<string | null>(null);
  public dateBefore = signal<string | null>(null);
  public searchControl = new FormControl('');
  public suggestions = signal<string[]>([]);

  private initialized = false;

  public filteredStats = computed(() => this.rawStats());

  constructor() {
    this.searchControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => {
      this.searchTerm.set(value || '');
      this.updateSuggestions(value || '');
    });

    effect(() => {
      const filters = {
        name: this.searchTerm(),
        sort_by: this.sortBy(),
        festival_ids: this.festivalIds(),
      };

      if (this.initialized) {
        untracked(() => this.fetchStats(filters));
      }
    });
  }
  

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['name']) this.searchTerm.set(params['name']);
    if (params['sort_by']) this.sortBy.set(params['sort_by']);
    if (params['festival_ids']) {
      this.festivalIds.set(params['festival_ids'].split(',').map(Number));
    }

    this.initialized = true;
    this.fetchStats();
  }

  fetchStats(filters: any = {}) {
    this.loading.set(true);
    this.statsService.getStats(filters).subscribe({
      next: (res) => { 
        this.rawStats.set(res); 
        this.loading.set(false); 
        this.error.set(false);

        if (this.availableFestivals().length === 0 && res.data) {
          const list = Object.entries(res.data).map(([name, group]: any) => ({
            id: group.items[0]?.festival_id,
            name: name
          })).filter(f => f.id);
          this.availableFestivals.set(list);
        }
      },
      error: () => { 
        this.error.set(true); 
        this.loading.set(false); 
      }
    });
  }

  updateSearch = (val: string) => this.searchTerm.set(val);
  updateSort = (val: string) => this.sortBy.set(val);
  updateCompare = (ids: number[]) => this.festivalIds.set(ids);

  formatServiceKey = (s: string | undefined) => s ? s.toUpperCase().replace(/\s+/g, '_') : 'NO_ACCESS';
  displayedColumns: string[] = ['name', 'avg_pricing', 'revenue', 'profit', 'distance', 'services', 'inventory'];
  returnZero = () => 0;

  private updateSuggestions(term: string) {
    if (term.length < 2) {
      this.suggestions.set([]);
      return;
    }
    const allNames = this.rawStats() ? 
      Object.values(this.rawStats()!.data).flatMap(g => g.items.map(i => i.name)) : [];
    
    const uniqueMatches = [...new Set(allNames)]
      .filter(n => n.toLowerCase().includes(term.toLowerCase()))
      .slice(0, 5);
    
    this.suggestions.set(uniqueMatches);
  }
}