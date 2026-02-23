import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

import { PerformanceService } from '../../../core/services/performance.service';
import { FestivalService } from '../../../core/services/festival.service';
import { Performance } from '../../../core/models/performance';
import { Festival } from '../../../core/models/festival';

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
    TranslateModule
  ],
  templateUrl: './public_schedule.html',
  styleUrls: ['./public_schedule.css']
})
export class PublicScheduleComponent implements OnInit {
  private performanceService = inject(PerformanceService);
  private festivalService = inject(FestivalService);
  public translate = inject(TranslateService);

  currentFestival = signal<Festival | null>(null);
  performanceGroups = signal<DayGroup[]>([]);
  isLoading = signal(true);
  
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

  loadSchedule(): void {
    this.isLoading.set(true);
    this.festivalService.getFestivals().subscribe({
      next: (festivals) => {
        const ongoing = festivals.find(f => f.status === 'ongoing');
        
        console.log('festival recu', festivals);
        
        if (ongoing) {
          this.currentFestival.set(ongoing);
          
          this.performanceService.getPerformances().subscribe({
            next: (allPerformances) => {
              const festivalPerformances = allPerformances.filter(p => 
                p.festival_id === ongoing.id || (p.festival && p.festival.id === ongoing.id)
              );

              const sortedData = festivalPerformances.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
              this.performanceGroups.set(this.groupByDay(sortedData));
              this.isLoading.set(false);
            },
            error: (err) => {
              console.error('Erreur performances:', err);
              this.isLoading.set(false);
            }
          });
        } else {
          this.currentFestival.set(null);
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('Erreur festivals:', err);
        this.isLoading.set(false);
      }
    });
  }

  private groupByDay(performances: Performance[]): DayGroup[] {
    const groups: { [key: string]: Performance[] } = {};
    performances.forEach(perf => {
      const dateKey = new Date(perf.start_at).toDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(perf);
    });
    return Object.keys(groups).map(key => ({
      date: new Date(key),
      performances: groups[key]
    }));
  }
}