import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { PerformanceService } from '../../../core/services/performance.service';
import { FestivalService } from '../../../core/services/festival.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { DateUtils } from '../../../core/utils/date.utils'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Performance } from '../../../core/models/performance';
import { Festival } from '../../../core/models/festival';

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
    MatDialogModule,
    MatSnackBarModule,
    MatSelectModule,
    MatFormFieldModule,  
    TranslateModule,
    MatProgressSpinnerModule,
    RouterModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('confirmDialogTemplate') confirmDialogTemplate!: TemplateRef<any>;

  private performanceService = inject(PerformanceService);
  private festivalService = inject(FestivalService); 
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  festival = signal<Festival | null>(null);
  allFestivals = signal<Festival[]>([]);

  isReadOnly = computed(() => this.festival()?.status === 'completed');
  
  performanceGroups = signal<DayGroup[]>([]);
  isLoading = signal(true);
  serverErrors = signal<string[]>([]);

  currentLang = toSignal(
    this.translate.onLangChange.pipe(map(event => this.formatLang(event.lang))),
    { initialValue: this.formatLang(this.translate.getCurrentLang()) }
  );

  displayedColumns: string[] = ['artist', 'title', 'stage', 'start_at', 'end_at', 'description', 'price', 'actions'];

  ngOnInit(): void {
    this.loadAllFestivals();

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.loadDashboardData(Number(idParam));
      } else {
        this.router.navigate(['/admin/festivals']);
      }
    });
  }

  private formatLang(lang: string | undefined): string {
    if (!lang) return 'en'; 
    return lang.split('-')[0];
  }

  async loadAllFestivals(): Promise<void> {
    try {
      const festivals = await firstValueFrom(this.festivalService.getFestivals());
      this.allFestivals.set(festivals);
    } catch (err) {
      console.error(this.translate.instant('DASHBOARD.FESTIVALS_LOAD_ERROR'), err);
    }
  }

  onFestivalChange(newFestivalId: number): void {
    this.router.navigate(['/admin/festivals', newFestivalId, 'dashboard']);
  }

  navigateToAdd(): void { 
    const currentFest = this.festival();
    if (currentFest && !this.isReadOnly()) {
      this.router.navigate(['/admin/festivals', currentFest.id, 'performances', 'new']);
    }
  }

  navigateToEdit(perfId: number): void {
    const currentFest = this.festival();
    if (currentFest && !this.isReadOnly()) {
      this.router.navigate(['/admin/festivals', currentFest.id, 'performances', perfId, 'edit']);
    }
  }

  async loadDashboardData(festivalId: number): Promise<void> {
    this.isLoading.set(true);
    this.serverErrors.set([]);

    try {
      const targetFestival = await firstValueFrom(this.festivalService.getFestival(festivalId));
      this.festival.set(targetFestival);

      const allPerformances = await firstValueFrom(this.performanceService.getPerformances());
      
      const festivalPerformances = allPerformances.filter(p => 
        Number(p.festival_id) === festivalId || (p.festival && Number(p.festival.id) === festivalId)
      );

      const sortedData = festivalPerformances.sort((a, b) => DateUtils.compareDates(a.start_at, b.start_at));
      this.performanceGroups.set(this.groupByDay(sortedData));

    } catch (err) {
      this.showErrorsAsSnackBar(err);
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
  
  async deletePerformance(id: number): Promise<void> {
    if (this.isReadOnly()) return;

    const dialogRef = this.dialog.open(this.confirmDialogTemplate, { width: '400px' });
    const result = await firstValueFrom(dialogRef.afterClosed());

    if (result) {
      this.serverErrors.set([]);
      try {
        await firstValueFrom(this.performanceService.deletePerformance(id));
        
        this.snackBar.open(
          this.translate.instant('DASHBOARD.DELETE_SUCCESS'), 
          this.translate.instant('COMMON.CLOSE'), 
          { duration: 3000 }
        );
        
        if (this.festival()) {
          await this.loadDashboardData(this.festival()!.id);
        }
      } catch (err) {
        this.showErrorsAsSnackBar(err);
      }
    }
  }

  private showErrorsAsSnackBar(err: any): void {
    const errors = this.errorHandler.parseRailsErrors(err);
    if (errors.length > 0) {
      this.snackBar.open(
        errors.join(' | '), 
        this.translate.instant('COMMON.CLOSE'), 
        { duration: 5000 }
      );
    }
  }
}