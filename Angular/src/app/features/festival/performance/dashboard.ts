import { Component, inject, signal, computed, ViewChild, TemplateRef, effect, OnDestroy, input } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PerformanceService } from '../../../core/services/performance.service';
import { FestivalService } from '../../../core/services/festival.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { DateUtils } from '../../../core/utils/date.utils'; 
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
    CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatDialogModule,
    MatSnackBarModule, MatSelectModule, MatFormFieldModule, MatInputModule,
    FormsModule, TranslateModule, MatProgressSpinnerModule, RouterModule,
    MatProgressBarModule, DatePipe, CurrencyPipe
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnDestroy {
  @ViewChild('confirmDialogTemplate') confirmDialogTemplate!: TemplateRef<any>;

  private performanceService = inject(PerformanceService);
  private festivalService = inject(FestivalService); 
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  id = input<string>(); 
  search = input<string>();
  stage = input<string>();
  sort = input<'asc' | 'desc'>();
  
  parsedId = computed(() => this.id() ? Number(this.id()) : null);
  parsedSearch = computed(() => this.search() || '');
  parsedStageId = computed(() => this.stage() ? Number(this.stage()) : null);
  parsedSort = computed(() => this.sort() || 'asc');
  allFestivals = signal<Festival[]>([]);
  festival = signal<Festival | null>(null);
  
  rawPerformances = signal<Performance[]>([]);
  performances = signal<Performance[]>([]);   
  
  isInitialLoading = signal(true);
  isPerformancesLoading = signal(false);
  
  forceReload = signal<number>(0);

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  displayedColumns: string[] = ['artist', 'title', 'stage', 'start_at', 'end_at', 'description', 'price', 'actions'];

  isLoading = computed(() => this.isInitialLoading());
  isReadOnly = computed(() => this.festival()?.status === 'completed');

  availableStages = computed(() => {
    const stages = new Map();
    this.rawPerformances().forEach(p => {
      if (p.stage) stages.set(p.stage.id, p.stage.name);
    });
    return Array.from(stages, ([id, name]) => ({ id, name }));
  });

  performanceGroups = computed(() => {
    const data = [...this.performances()];
    const dir = this.parsedSort();
    data.sort((a, b) => {
      const dateA = new Date(a.start_at).getTime();
      const dateB = new Date(b.start_at).getTime();
      return dir === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return this.groupByDay(data);
  });

  currentLang = toSignal(
    this.translate.onLangChange.pipe(map(event => event.lang?.split('-')[0] || 'fr')),
    { initialValue: this.translate.getCurrentLang().split('-')[0] || 'fr' }
  );

  constructor() {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(val => {
      this.updateUrl({ search: val || null });
    });

    effect(async () => {
      const festId = this.parsedId();
      this.forceReload();
      
      if (!festId) return;

      this.isInitialLoading.set(true);
      try {
        const [fests, current, allPerfs] = await Promise.all([
          firstValueFrom(this.festivalService.getFestivals()),
          firstValueFrom(this.festivalService.getFestival(festId)),
          firstValueFrom(this.performanceService.getPerformances({ festival_id: festId }))
        ]);
        
        this.allFestivals.set(fests);
        this.festival.set(current);
        this.rawPerformances.set(allPerfs); 
      } catch (err) {
        this.showErrorsAsSnackBar(err);
      } finally {
        this.isInitialLoading.set(false);
      }
    });

    effect(async () => {
      const festId = this.parsedId();
      const q = this.parsedSearch();
      const sId = this.parsedStageId();
      this.forceReload(); 
      
      if (!festId) return;

      this.isPerformancesLoading.set(true);
      try {
        const params: any = { festival_id: festId };
        if (q) params.search = q;
        if (sId) params.stage_id = sId;

        const data = await firstValueFrom(this.performanceService.getPerformances(params));
        this.performances.set(data);
      } catch (err) {
        this.showErrorsAsSnackBar(err);
      } finally {
        this.isPerformancesLoading.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  updateSearch(val: string) { this.searchSubject.next(val); }
  
  updateFilter(id: number | null) { this.updateUrl({ stage: id || null }); }
  
  toggleSort() { 
    const newSort = this.parsedSort() === 'asc' ? 'desc' : 'asc';
    this.updateUrl({ sort: newSort === 'asc' ? null : newSort }); 
  }
  
  onFestivalChange(id: number) { 
    this.router.navigate(['/admin/festivals', id, 'dashboard']); 
  }

  private updateUrl(queryParams: any) {
    this.router.navigate([], { 
      relativeTo: this.route, 
      queryParams, 
      queryParamsHandling: 'merge', 
      replaceUrl: true 
    });
  }

  navigateToAdd() {
    if (this.festival() && !this.isReadOnly()) {
      this.router.navigate(['/admin/festivals', this.festival()!.id, 'performances', 'new']);
    }
  }

  navigateToEdit(performanceId: number) {
    if (this.festival() && !this.isReadOnly()) {
      this.router.navigate(['/admin/festivals', this.festival()!.id, 'performances', performanceId, 'edit']);
    }
  }

  async deletePerformance(id: number) {
    if (this.isReadOnly()) return;

    const dialogRef = this.dialog.open(this.confirmDialogTemplate, { width: '400px' });
    const confirmed = await firstValueFrom(dialogRef.afterClosed());

    if (confirmed) {
      try {
        await firstValueFrom(this.performanceService.deletePerformance(id));
        this.snackBar.open(this.translate.instant('DASHBOARD.DELETE_SUCCESS'), 'OK', { duration: 3000 });
        this.forceReload.update(v => v + 1);
      } catch (err) {
        this.showErrorsAsSnackBar(err);
      }
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

  private showErrorsAsSnackBar(err: any) {
    const errors = this.errorHandler.parseRailsErrors(err);
    if (errors.length > 0) this.snackBar.open(errors.join(' | '), 'OK', { duration: 5000 });
  }
}