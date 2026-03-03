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
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
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
    CommonModule, MatButtonModule, MatIconModule, MatTableModule, MatDialogModule,
    MatSnackBarModule, MatSelectModule, MatFormFieldModule, MatInputModule,
    FormsModule, TranslateModule, MatProgressSpinnerModule, RouterModule
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
  rawPerformances = signal<Performance[]>([]);
  isLoading = signal(true);

  searchQuery = signal<string>('');
  filterStageId = signal<number | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');

  isReadOnly = computed(() => this.festival()?.status === 'completed');

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

    // filter par scene
    if (stageId) data = data.filter(p => p.stage?.id === stageId);

    // search par artist ou nom perf
    if (query) {
      data = data.filter(p => 
        p.title?.toLowerCase().includes(query) || 
        p.artist?.name.toLowerCase().includes(query)
      );
    }

    // sort par date
    return data.sort((a, b) => {
      const dateA = new Date(a.start_at).getTime();
      const dateB = new Date(b.start_at).getTime();
      return dir === 'asc' ? dateA - dateB : dateB - dateA;
    });
  });

  performanceGroups = computed(() => this.groupByDay(this.filteredPerformances()));

  currentLang = toSignal(
    this.translate.onLangChange.pipe(map(event => this.formatLang(event.lang))),
    { initialValue: this.formatLang(this.translate.getCurrentLang()) }
  );

  displayedColumns: string[] = ['artist', 'title', 'stage', 'start_at', 'end_at', 'description', 'price', 'actions'];

  ngOnInit(): void {
    this.loadAllFestivals();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.loadDashboardData(Number(id));
    });
  }

  updateSearch(val: string) { this.searchQuery.set(val); }
  updateFilter(id: number | null) { this.filterStageId.set(id); }
  toggleSort() { this.sortDirection.update(d => d === 'asc' ? 'desc' : 'asc'); }

  async loadAllFestivals() {
    try {
      const data = await firstValueFrom(this.festivalService.getFestivals());
      this.allFestivals.set(data);
    } catch (err) { console.error(err); }
  }

  async loadDashboardData(id: number) {
    this.isLoading.set(true);
    try {
      const fest = await firstValueFrom(this.festivalService.getFestival(id));
      this.festival.set(fest);
      const perfs = await firstValueFrom(this.performanceService.getPerformances());
      const filtered = perfs.filter(p => Number(p.festival_id) === id || (p.festival && Number(p.festival.id) === id));
      this.rawPerformances.set(filtered);
    } catch (err) { this.showErrorsAsSnackBar(err); }
    finally { this.isLoading.set(false); }
  }

  onFestivalChange(id: number) { this.router.navigate(['/admin/festivals', id, 'dashboard']); }
  navigateToAdd() { this.router.navigate(['/admin/festivals', this.festival()?.id, 'performances', 'new']); }
  navigateToEdit(id: number) { this.router.navigate(['/admin/festivals', this.festival()?.id, 'performances', id, 'edit']); }

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

  async deletePerformance(id: number) {
    const dialogRef = this.dialog.open(this.confirmDialogTemplate, { width: '400px' });
    if (await firstValueFrom(dialogRef.afterClosed())) {
      try {
        await firstValueFrom(this.performanceService.deletePerformance(id));
        this.snackBar.open(this.translate.instant('DASHBOARD.DELETE_SUCCESS'), 'OK', { duration: 3000 });
        this.loadDashboardData(this.festival()!.id);
      } catch (err) { this.showErrorsAsSnackBar(err); }
    }
  }

  private showErrorsAsSnackBar(err: any) {
    const errors = this.errorHandler.parseRailsErrors(err);
    this.snackBar.open(errors.join(' | '), 'OK', { duration: 5000 });
  }

  private formatLang(lang: string | undefined): string { return lang ? lang.split('-')[0] : 'en'; }
}