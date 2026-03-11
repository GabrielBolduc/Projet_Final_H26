import { Component, inject, OnInit, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
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
    MatCardModule, FormsModule 
  ],
  templateUrl: './hebergement.html',
  styleUrls: ['./hebergement.css']
})
export class HebergementComponent implements OnInit {
  private statsService = inject(AccommodationsStatsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public rawStats = signal<AccommodationStatsResponse | null>(null);
  public loading = signal(true);
  public error = signal(false);

  public filterFestivalName = signal<string | null>(null);
  public searchTerm = signal<string>('');
  private searchSubject = new Subject<string>();

  private initialized = false;

  public availableFestivals = computed(() => {
    const data = this.rawStats();
    return data ? Object.keys(data.data) : [];
  });

  public filteredStats = computed(() => {
    const data = this.rawStats();
    if (!data) return null;

    const term = this.searchTerm().toLowerCase();
    const festName = this.filterFestivalName();

    const filtered: any = {};

    Object.entries(data.data).forEach(([name, group]) => {
      const matchesFest = !festName || name === festName;

      if (matchesFest) {
        const filteredItems = group.items.filter(item => 
          item.name.toLowerCase().includes(term)
        );

        if (filteredItems.length > 0) {
          filtered[name] = { ...group, items: filteredItems };
        }
      }
    });

    return { ...data, data: filtered };
  });

  constructor() {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(val => this.searchTerm.set(val));

    effect(() => {
      if (!this.initialized) return;
      const queryParams = {
        festival: this.filterFestivalName(),
        q: this.searchTerm() || null
      };
      this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge', replaceUrl: true });
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    if (params['festival']) this.filterFestivalName.set(params['festival']);
    if (params['q']) this.searchTerm.set(params['q']);

    this.initialized = true;
    this.fetchStats();
  }

  fetchStats() {
    this.loading.set(true);
    this.statsService.getStats().subscribe({
      next: (res) => { this.rawStats.set(res); this.loading.set(false); },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }

  updateFest = (val: string | null) => this.filterFestivalName.set(val);
  updateSearch(value: string): void {
    this.searchSubject.next(value);
  }

  returnZero = () => 0;
  formatServiceKey = (s: string | undefined) => s ? s.toUpperCase().replace(/\s+/g, '_') : 'NO_ACCESS';
  displayedColumns: string[] = ['name', 'avg_pricing', 'revenue', 'profit', 'distance', 'services', 'inventory'];
}