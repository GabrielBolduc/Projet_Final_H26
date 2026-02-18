import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PerformanceService } from '../../../../core/services/performance.service';
import { Performance } from '../../../../core/models/performance';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

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
    MatTableModule
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
  
  currentLang = signal<string>(this.formatLang(this.translate.currentLang));

  displayedColumns: string[] = ['artist', 'title', 'stage', 'start_at', 'end_at', 'description', 'actions'];

  ngOnInit(): void {
    this.loadPerformances();

    this.translate.onLangChange.subscribe((event) => {
      this.currentLang.set(this.formatLang(event.lang));
    });
  }

  private formatLang(lang: string | undefined): string {
    if (!lang) return 'en'; 
    return lang.split('-')[0];
  }

  loadPerformances(): void {
    this.isLoading.set(true);
    this.performanceService.getPerformances().subscribe({
      next: (data) => {
        const sortedData = data.sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
        this.performanceGroups.set(this.groupByDay(sortedData));
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

  navigateToAdd(): void { this.router.navigate(['/admin/performances/new']); }
  navigateToEdit(id: number): void { this.router.navigate(['/admin/performances', id, 'edit']); }
  
  deletePerformance(id: number): void {
    if(confirm('Supprimer ?')) {
      this.performanceService.deletePerformance(id).subscribe({
        next: () => this.loadPerformances()
      });
    }
  }
}