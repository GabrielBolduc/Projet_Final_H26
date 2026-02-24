import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { PerformanceService } from '../../../core/services/performance.service';
import { FestivalService } from '../../../core/services/festival.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { DateUtils } from '../../../core/utils/date.utils'; 

import { Performance } from '../../../core/models/performance';
import { Festival } from '../../../core/models/festival'

interface DayGroup {
  date: Date;
  performances: Performance[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    MatButtonModule, 
    MatIconModule,
    MatTableModule,
    TranslateModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  private performanceService = inject(PerformanceService);
  private festivalService = inject(FestivalService); 
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);
  public translate = inject(TranslateService);

  performanceGroups = signal<DayGroup[]>([]);
  isLoading = signal(true);
  serverErrors = signal<string[]>([]);
  festivalId = signal<number | null>(null); 

  currentLang = toSignal(
    this.translate.onLangChange.pipe(
      map(event => this.formatLang(event.lang))
    ),
    { initialValue: this.formatLang(this.translate.getCurrentLang()) }
  );

  displayedColumns: string[] = ['artist', 'title', 'stage', 'start_at', 'end_at', 'description', 'actions'];

  ngOnInit(): void {
    this.loadPerformances();
  }

  private formatLang(lang: string | undefined): string {
    if (!lang) return 'en'; 
    return lang.split('-')[0];
  }

  navigateToAdd(): void { 
    const id = this.festivalId();
    if (id) {
      this.router.navigate(['/admin/festivals', id, 'performances', 'new']);
    } else {
      this.serverErrors.set(["Impossible d'ajouter une performance : Aucun festival en cours trouvé."]);
    }
  }

  navigateToEdit(perfId: number): void {
    const targetFestivalId = this.festivalId(); 
    if (targetFestivalId) {
      this.router.navigate(['/admin/festivals', targetFestivalId, 'performances', perfId, 'edit']);
    }
  }

  loadPerformances(): void {
    this.isLoading.set(true);
    this.serverErrors.set([]);

    this.festivalService.getFestivals().subscribe({
      next: (festivals) => {
        const ongoingFestival = festivals.find(f => f.status === 'ongoing');

        if (ongoingFestival) {
          this.festivalId.set(ongoingFestival.id);

          this.performanceService.getPerformances().subscribe({
            next: (allPerformances) => {
              const festivalPerformances = allPerformances.filter(p => 
                p.festival_id === ongoingFestival.id || (p.festival && p.festival.id === ongoingFestival.id)
              );

              const sortedData = festivalPerformances.sort((a, b) => DateUtils.compareDates(a.start_at, b.start_at));
              this.performanceGroups.set(this.groupByDay(sortedData));
              this.isLoading.set(false);
            },
            error: (err) => {
              this.serverErrors.set(this.errorHandler.parseRailsErrors(err));
              this.isLoading.set(false);
            }
          });
        } else {
          this.festivalId.set(null);
          this.performanceGroups.set([]);
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.serverErrors.set(this.errorHandler.parseRailsErrors(err));
        this.isLoading.set(false);
      }
    });
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
  
  deletePerformance(id: number): void {
    if(confirm('Supprimer définitivement cette performance ?')) {
      this.serverErrors.set([]);
      this.performanceService.deletePerformance(id).subscribe({
        next: () => this.loadPerformances(),
        error: (err) => {
          this.serverErrors.set(this.errorHandler.parseRailsErrors(err));
        }
      });
    }
  }
}