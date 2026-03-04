import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef, effect, OnDestroy } from '@angular/core';
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
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('confirmDialogTemplate') confirmDialogTemplate!: TemplateRef<any>;

  private performanceService = inject(PerformanceService);
  private festivalService = inject(FestivalService); 
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  private initialized = false;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  currentFestivalId = signal<number | null>(null);
  searchQuery = signal<string>('');
  filterStageId = signal<number | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  allFestivals = signal<Festival[]>([]);
  festival = signal<Festival | null>(null);
  
  rawPerformances = signal<Performance[]>([]); 
  performances = signal<Performance[]>([]); 
  
  isInitialLoading = signal(true);
  isPerformancesLoading = signal(false);

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
    const dir = this.sortDirection();
    data.sort((a, b) => {
      const dateA = new Date(a.start_at).getTime();
      const dateB = new Date(b.start_at).getTime();
      return dir === 'asc' ? dateA - dateB : dateB - dateA;
    });
    return this.groupByDay(data);
  });

  currentLang = toSignal(
    this.translate.onLangChange.pipe(map(event => event.lang?.split('-')[0] || 'fr')),
    { initialValue: this.translate.currentLang?.split('-')[0] || 'fr' }
  );

  constructor() {
    effect(() => {
      if (!this.initialized) return;
      const queryParams = {
        search: this.searchQuery() || null,
        stage: this.filterStageId() || null,
        sort: this.sortDirection() === 'asc' ? null : this.sortDirection()
      };
      this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge', replaceUrl: true });
    });

    effect(async () => {
      const festivalId = this.currentFestivalId();
      if (!festivalId) return;

      this.isPerformancesLoading.set(true);
      try {
        const params: any = { festival_id: festivalId };
        if (this.searchQuery()) params.search = this.searchQuery();
        if (this.filterStageId()) params.stage_id = this.filterStageId();

        const data = await firstValueFrom(this.performanceService.getPerformances(params));
        this.performances.set(data);
      } catch (err) {
        this.showErrorsAsSnackBar(err);
      } finally {
        this.isPerformancesLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(val => this.searchQuery.set(val));

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        const numId = Number(id);
        this.currentFestivalId.set(numId);
        this.loadInitialContext(numId);
      }
    });

    const params = this.route.snapshot.queryParams;
    if (params['search']) this.searchQuery.set(params['search']);
    if (params['stage']) this.filterStageId.set(Number(params['stage']));
    if (params['sort']) this.sortDirection.set(params['sort'] as 'asc' | 'desc');

    this.initialized = true;
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  async loadInitialContext(festivalId: number) {
    this.isInitialLoading.set(true);
    try {
      const [fests, current, allPerfs] = await Promise.all([
        firstValueFrom(this.festivalService.getFestivals()),
        firstValueFrom(this.festivalService.getFestival(festivalId)),
        firstValueFrom(this.performanceService.getPerformances({ festival_id: festivalId }))
      ]);
      
      this.allFestivals.set(fests);
      this.festival.set(current);
      
      this.rawPerformances.set(allPerfs); 
    } catch (err) {
      this.showErrorsAsSnackBar(err);
    } finally {
      this.isInitialLoading.set(false);
    }
  }

  updateSearch(val: string) { this.searchSubject.next(val); }
  updateFilter(id: number | null) { this.filterStageId.set(id); }
  toggleSort() { this.sortDirection.update((d: 'asc' | 'desc') => d === 'asc' ? 'desc' : 'asc'); }
  onFestivalChange(id: number) { this.router.navigate(['/admin/festivals', id, 'dashboard']); }

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
        
        const currentId = this.currentFestivalId();
        this.currentFestivalId.set(null);
        this.currentFestivalId.set(currentId);
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