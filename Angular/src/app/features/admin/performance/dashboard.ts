import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PerformanceService } from '../../../core/services/performance.service';
import { Performance } from '../../../core/models/performance';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

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
  private router = inject(Router);
  public translate = inject(TranslateService);

  performanceGroups = signal<DayGroup[]>([]);
  isLoading = signal(true);

  festivalId = signal<number | null>(null); 
  currentLang = toSignal(
    this.translate.onLangChange.pipe(
      map(event => this.formatLang(event.lang))
    ),
    { initialValue: this.formatLang(this.translate.currentLang) }
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
      console.error("Aucun festival trouvé pour associer cette performance.");
    }
  }

  navigateToEdit(perfId: number): void {
    let targetFestivalId = this.festivalId(); // On lit le Signal
    
    const allGroups = this.performanceGroups();
    for (const group of allGroups) {
      const foundPerf = group.performances.find(p => p.id === perfId);
      if (foundPerf) {
        targetFestivalId = foundPerf.festival?.id || foundPerf.festival_id || this.festivalId();
        break;
      }
    }

    if (targetFestivalId) {
      this.router.navigate(['/admin/festivals', targetFestivalId, 'performances', perfId, 'edit']);
    }
  }

  loadPerformances(): void {
    this.isLoading.set(true);
    this.performanceService.getPerformances().subscribe({
      next: (data) => {
        const sortedData = data.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
        this.performanceGroups.set(this.groupByDay(sortedData));
        
        if (sortedData.length > 0) {
          const firstPerf = sortedData[0];
          this.festivalId.set(firstPerf.festival?.id || firstPerf.festival_id || null);
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
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
  
  deletePerformance(id: number): void {
    if(confirm('Supprimer ?')) {
      this.performanceService.deletePerformance(id).subscribe({
        next: () => this.loadPerformances()
      });
    }
  }
}