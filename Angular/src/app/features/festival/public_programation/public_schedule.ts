import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs'; 
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

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
    CommonModule, 
    RouterModule,
    TranslateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule
  ],
  templateUrl: './public_schedule.html',
  styleUrls: ['./public_schedule.css']
})
export class PublicScheduleComponent implements OnInit {
  private performanceService = inject(PerformanceService);
  private festivalService = inject(FestivalService);
  private errorHandler = inject(ErrorHandlerService);
  public translate = inject(TranslateService);
  private sanitizer = inject(DomSanitizer);

  currentFestival = signal<Festival | null>(null);
  rawPerformances = signal<Performance[]>([]);
  festivalArtists = signal<FestivalArtist[]>([]);
  
  isLoading = signal(true);
  serverErrors = signal<string[]>([]); 
  searchQuery = signal<string>('');
  filterStageId = signal<number | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  availableStages = computed(() => {
    const stages = new Map();
    this.rawPerformances().forEach(p => {
      if (p.stage) stages.set(p.stage.id, p.stage.name);
    });
    return Array.from(stages, ([id, name]) => ({ id, name }));
  });

  filteredPerformances = computed(() => {
    let data = [...this.rawPerformances()];
    const query = this.searchQuery().toLowerCase().trim();
    const stageId = this.filterStageId();
    const dir = this.sortDirection();

    if (stageId) {
      data = data.filter(p => p.stage?.id === stageId);
    }

    if (query) {
      data = data.filter(p => 
        p.title?.toLowerCase().includes(query) || 
        p.artist?.name.toLowerCase().includes(query)
      );
    }

    return data.sort((a, b) => {
      const dateA = new Date(a.start_at).getTime();
      const dateB = new Date(b.start_at).getTime();
      return dir === 'asc' ? dateA - dateB : dateB - dateA;
    });
  });

  performanceGroups = computed(() => {
    return this.groupByDay(this.filteredPerformances());
  });

  mapUrl = computed(() => {
    const festival = this.currentFestival();
    if (!festival || !festival.latitude || !festival.longitude) return null;

    const lat = Number(festival.latitude);
    const lng = Number(festival.longitude);
    const offset = 0.005; 
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - offset},${lat - offset},${lng + offset},${lat + offset}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  currentLang = toSignal(
    this.translate.onLangChange.pipe(map(event => this.formatLang(event.lang))),
    { initialValue: this.formatLang(this.translate.getCurrentLang()) }
  );

  displayedColumns: string[] = ['artist', 'title', 'stage', 'start_at', 'end_at', 'description'];

  ngOnInit(): void {
    this.loadSchedule();
  }

  updateSearch(val: string) { this.searchQuery.set(val); }
  updateFilter(id: number | null) { this.filterStageId.set(id); }
  toggleSort() { this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc'); }

  private formatLang(lang: string | undefined): string {
    return lang ? lang.split('-')[0] : 'en';
  }

  async loadSchedule(): Promise<void> {
    this.isLoading.set(true);
    this.serverErrors.set([]);

    try {
      const festivals = await firstValueFrom(this.festivalService.getFestivals());
      const ongoing = festivals.find(f => f.status === 'ongoing');

      if (ongoing) {
        this.currentFestival.set(ongoing);
        
        const allPerformances = await firstValueFrom(this.performanceService.getPerformances());
        const festivalPerformances = allPerformances.filter(p => 
          Number(p.festival_id) === Number(ongoing.id) || (p.festival && Number(p.festival.id) === Number(ongoing.id))
        );
        
        this.rawPerformances.set(festivalPerformances);
        const artistMap = new Map<number, FestivalArtist>();
        [...festivalPerformances]
          .sort((a, b) => DateUtils.compareDates(a.start_at, b.start_at))
          .forEach(perf => {
            if (perf.artist && perf.artist.id && !artistMap.has(perf.artist.id)) {
              artistMap.set(perf.artist.id, { artist: perf.artist, date: perf.start_at });
            }
          });
        this.festivalArtists.set(Array.from(artistMap.values()));

      } else {
        this.currentFestival.set(null);
      }
    } catch (err) {
      this.serverErrors.set(this.errorHandler.parseRailsErrors(err));
    } finally {
      this.isLoading.set(false);
    }
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