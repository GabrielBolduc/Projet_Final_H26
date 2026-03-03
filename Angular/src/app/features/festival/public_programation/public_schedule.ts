import { Component, OnInit, inject, signal, computed } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs'; 

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
    MatButtonModule
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

  // --- SIGNALS D'ÉTAT ---
  currentFestival = signal<Festival | null>(null);
  performanceGroups = signal<DayGroup[]>([]);
  festivalArtists = signal<FestivalArtist[]>([]);
  
  isLoading = signal(true);
  serverErrors = signal<string[]>([]); 
  currentLang = signal<string>(this.formatLang(this.translate.getCurrentLang()));

  displayedColumns: string[] = ['artist', 'title', 'stage', 'start_at', 'end_at', 'description'];
  
  mapUrl = computed(() => {
    const festival = this.currentFestival();

    if (!festival || !festival.latitude || !festival.longitude) {
      return null;
    }

    const lat = Number(festival.latitude);
    const lng = Number(festival.longitude);
    const offset = 0.005; 

    const minLng = lng - offset;
    const minLat = lat - offset;
    const maxLng = lng + offset;
    const maxLat = lat + offset;

    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${minLng},${minLat},${maxLng},${maxLat}&layer=mapnik&marker=${lat},${lng}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  ngOnInit(): void {
    this.loadSchedule();

    this.translate.onLangChange.subscribe((event) => {
      this.currentLang.set(this.formatLang(event.lang));
    });
  }

  private formatLang(lang: string | undefined): string {
    if (!lang) return 'en'; 
    return lang.split('-')[0];
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
        
        const artistMap = new Map<number, FestivalArtist>();
        
        const sortedForArtists = [...festivalPerformances].sort((a, b) => DateUtils.compareDates(a.start_at, b.start_at));
        
        sortedForArtists.forEach(perf => {
          if (perf.artist && perf.artist.id && !artistMap.has(perf.artist.id)) {
            artistMap.set(perf.artist.id, {
              artist: perf.artist,
              date: perf.start_at 
            });
          }
        });
        this.festivalArtists.set(Array.from(artistMap.values()));

        const sortedData = festivalPerformances.sort((a, b) => DateUtils.compareDates(a.start_at, b.start_at));
        this.performanceGroups.set(this.groupByDay(sortedData));
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