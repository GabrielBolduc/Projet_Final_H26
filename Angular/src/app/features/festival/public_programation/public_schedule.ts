import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { firstValueFrom } from 'rxjs'; 
import { PerformanceService } from '../../../core/services/performance.service';
import { FestivalService } from '../../../core/services/festival.service';
import { Performance } from '../../../core/models/performance';
import { Festival } from '../../../core/models/festival';
import { DateUtils } from '../../../core/utils/date.utils'; 
import { ErrorHandlerService } from '../../../core/services/error-handler.service'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
interface DayGroup {
  date: Date;
  performances: Performance[];
}

@Component({
  selector: 'app-public-schedule',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule,
    MatTableModule,
    TranslateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './public_schedule.html',
  styleUrls: ['./public_schedule.css']
})
export class PublicScheduleComponent implements OnInit {
  private performanceService = inject(PerformanceService);
  private festivalService = inject(FestivalService);
  private errorHandler = inject(ErrorHandlerService);
  public translate = inject(TranslateService);

  currentFestival = signal<Festival | null>(null);
  performanceGroups = signal<DayGroup[]>([]);
  isLoading = signal(true);
  serverErrors = signal<string[]>([]); 
  
  currentLang = signal<string>(this.formatLang(this.translate.getCurrentLang()));

  displayedColumns: string[] = ['artist', 'title', 'stage', 'start_at', 'end_at', 'description'];

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