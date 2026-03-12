import { Component, inject, signal, computed, effect, input, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PerformanceService } from '../../../core/services/performance.service';
import { FestivalService } from '../../../core/services/festival.service';
import { Performance } from '../../../core/models/performance';
import { Festival } from '../../../core/models/festival';
import { Artist } from '../../../core/models/artist';
import { DateUtils } from '../../../core/utils/date.utils'; 
import { ErrorHandlerService } from '../../../core/services/error-handler.service'; 

interface DayGroup {
  date: Date;
  performances: Performance[];
}

interface FestivalArtist {
  artist: Artist;
  date: string;
}

@Component({
  selector: 'app-public-schedule',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, MatProgressSpinnerModule,
    MatIconModule, MatTableModule, MatCardModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, FormsModule, DatePipe
  ],
  templateUrl: './public_schedule.html',
  styleUrls: ['./public_schedule.css']
})
export class PublicScheduleComponent implements OnDestroy {
  private performanceService = inject(PerformanceService);
  private festivalService = inject(FestivalService);
  private errorHandler = inject(ErrorHandlerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);
  public translate = inject(TranslateService);

  search = input<string>();
  stage = input<string>();
  sort = input<'asc' | 'desc'>();

  currentFestival = signal<Festival | null>(null);
  rawPerformances = signal<Performance[]>([]); 
  performances = signal<Performance[]>([]); 
  festivalArtists = signal<FestivalArtist[]>([]);
  
  isLoading = signal(true);
  isSearching = signal(false); 
  serverErrors = signal<string[]>([]); 

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  parsedSearch = computed(() => this.search() || '');
  parsedStageId = computed(() => this.stage() ? Number(this.stage()) : null);
  parsedSort = computed(() => this.sort() || 'asc');

  availableStages = computed(() => {
    const stages = new Map();
    this.rawPerformances().forEach(p => {
      if (p.stage) stages.set(p.stage.id, p.stage.name);
    });
    return Array.from(stages, ([id, name]) => ({ id, name }));
  });

  performanceGroups = computed(() => {
    let data = [...this.performances()]; 
    const dir = this.parsedSort();
    
    data.sort((a, b) => {
      const dateA = new Date(a.start_at).getTime();
      const dateB = new Date(b.start_at).getTime();
      return dir === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return this.groupByDay(data);
  });

  mapUrl = computed(() => {
    const f = this.currentFestival();
    if (!f?.latitude || !f?.longitude) return null;
    const lat = Number(f.latitude);
    const lng = Number(f.longitude);
    const offset = 0.01; 
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - offset},${lat - offset},${lng + offset},${lat + offset}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  currentLang = toSignal(
    this.translate.onLangChange.pipe(map(event => this.formatLang(event.lang))),
    { initialValue: this.formatLang(this.translate.getCurrentLang()) }
  );

  displayedColumns: string[] = ['artist', 'title', 'stage', 'start_at', 'end_at', 'description'];

  constructor() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(val => {
      this.updateUrl({ search: val || null });
    });

    effect(async () => {
      const festival = this.currentFestival();
      if (!festival) return;

      const q = this.parsedSearch();
      const sId = this.parsedStageId();

      this.isSearching.set(true);

      try {
        const params: any = { festival_id: festival.id };
        if (q) params.search = q;
        if (sId) params.stage_id = sId;
        const data = await firstValueFrom(this.performanceService.getPerformances(params));
        this.performances.set(data);
      } catch (err) {
        console.error("Erreur de filtrage", err);
      } finally {
        this.isSearching.set(false);
      }
    });

    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  async loadInitialData(): Promise<void> {
    this.isLoading.set(true);
    this.serverErrors.set([]);

    try {
      const ongoing = await firstValueFrom(this.festivalService.getCurrentFestival());

      if (ongoing) {
        this.currentFestival.set(ongoing);
        const all = await firstValueFrom(this.performanceService.getPerformances({ festival_id: ongoing.id }));
        this.rawPerformances.set(all);
        
        const artistMap = new Map<number, FestivalArtist>();
        [...all].sort((a, b) => DateUtils.compareDates(a.start_at, b.start_at))
          .forEach(perf => {
            if (perf.artist && perf.artist.id && !artistMap.has(perf.artist.id)) {
              artistMap.set(perf.artist.id, { artist: perf.artist, date: perf.start_at });
            }
          });
        this.festivalArtists.set(Array.from(artistMap.values()));
      }
    } catch (err) {
      this.serverErrors.set(this.errorHandler.parseRailsErrors(err));
    } finally {
      this.isLoading.set(false);
    }
  }
  
  updateSearch(val: string) { 
    this.searchSubject.next(val); 
  }

  updateFilter(id: number | null) { 
    this.updateUrl({ stage: id || null });
  }

  toggleSort() { 
    const newSort = this.parsedSort() === 'asc' ? 'desc' : 'asc';
    this.updateUrl({ sort: newSort === 'asc' ? null : newSort });
  }

  private updateUrl(queryParams: any) {
    this.router.navigate([], { 
      relativeTo: this.route, 
      queryParams, 
      queryParamsHandling: 'merge', 
      replaceUrl: true 
    });
  }

  private formatLang(lang: string | undefined): string {
    return lang ? lang.split('-')[0] : 'en';
  }

  private groupByDay(performances: Performance[]): DayGroup[] {
    const groups: { [key: string]: Performance[] } = {};
    performances.forEach(perf => {
      const dateKey = DateUtils.toDateStringKey(perf.start_at);
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(perf);
    });
    return Object.keys(groups).map(key => ({
      date: DateUtils.toDate(key),
      performances: groups[key]
    }));
  }
}