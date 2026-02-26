import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { PerformanceService } from '../../../core/services/performance.service';
import { ArtistService } from '../../../core/services/artist.service';
import { StageService } from '../../../core/services/stage.service';
import { FestivalService } from '../../../core/services/festival.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

import { Artist } from '../../../core/models/artist';
import { Stage } from '../../../core/models/stage';
import { Festival } from '../../../core/models/festival';
import { DateUtils } from '../../../core/utils/date.utils'; 
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const timeRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const start = control.get('start_time')?.value;
  const end = control.get('end_time')?.value;

  if (start && end && start >= end) {
    return { timeRangeInvalid: true };
  }
  return null;
};

@Component({
  selector: 'app-add-performance',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatIconModule,
    TranslateModule,MatProgressSpinnerModule
  ],
  templateUrl: './add_performance.html',
  styleUrls: ['./add_performance.css']
})
export class AddPerformanceComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  private performanceService = inject(PerformanceService);
  private artistService = inject(ArtistService);
  private stageService = inject(StageService);
  private festivalService = inject(FestivalService);
  private errorHandler = inject(ErrorHandlerService);
  public translate = inject(TranslateService);

  form: FormGroup;
  isEditMode = signal(false);
  performanceId: number | null = null;
  currentFestivalId = signal<number | null>(null);
  isLoading = signal(false);

  serverErrors = signal<string[]>([]);

  artists = signal<Artist[]>([]);
  stages = signal<Stage[]>([]);
  festivals = signal<Festival[]>([]);

  constructor() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(20)]],
      description: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      date: [new Date(), Validators.required],
      start_time: ['20:00', Validators.required],
      end_time: ['22:00', Validators.required],
      artist_id: [null, Validators.required],
      stage_id: [null, Validators.required],
      festival_id: [null, Validators.required]
    }, { validators: timeRangeValidator });
  }

  ngOnInit(): void {
    const festId = this.route.snapshot.paramMap.get('id');
    if (festId) {
      this.currentFestivalId.set(Number(festId));
      this.form.patchValue({ festival_id: Number(festId) });
    }

    this.loadDropdowns();

    const perfIdParam = this.route.snapshot.paramMap.get('perfId');
    if (perfIdParam) {
      this.isEditMode.set(true);
      this.performanceId = +perfIdParam;
      this.loadPerformanceData(this.performanceId);
    }
  }

  goBack(): void {
    const festId = this.currentFestivalId();
    if (festId) {
      this.router.navigate(['/admin/festivals', festId, 'dashboard']);
    } else {
      this.router.navigate(['/admin/festivals']);
    }
  }

  async loadDropdowns() {
    try {
      const [artistsData, stagesData, festivalsData] = await Promise.all([
        firstValueFrom(this.artistService.getArtists()),
        firstValueFrom(this.stageService.getStages()),
        firstValueFrom(this.festivalService.getFestivals())
      ]);

      this.artists.set(artistsData);
      this.stages.set(stagesData);

      const activeFestivals = festivalsData.filter(f => f.status !== 'completed');
      this.festivals.set(activeFestivals);

      if (this.isEditMode() && this.performanceId) {
        this.checkCurrentFestivalVisibility(festivalsData);
      }
    } catch (err) {
      this.serverErrors.set(['Erreur lors du chargement des sélecteurs.']);
    }
  }

  private async checkCurrentFestivalVisibility(allFestivals: Festival[]) {
    try {
      const perf = await firstValueFrom(this.performanceService.getPerformance(this.performanceId!));
      const currentFestId = perf.festival?.id || perf.festival_id;
      const isInList = this.festivals().find(f => f.id === currentFestId);
      
      if (!isInList) {
        const oldFestival = allFestivals.find(f => f.id === currentFestId);
        if (oldFestival) {
          this.festivals.update(list => [...list, oldFestival]);
        }
      }
    } catch (err) {
    }
  }

  async loadPerformanceData(id: number) {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.performanceService.getPerformance(id));
      const start = new Date(data.start_at);
      const end = new Date(data.end_at);

      this.form.patchValue({
        title: data.title,
        description: data.description,
        price: data.price,
        artist_id: data.artist?.id || data.artist_id,
        stage_id: data.stage?.id || data.stage_id,
        festival_id: data.festival?.id || data.festival_id,
        
        date: start,
        start_time: DateUtils.formatTime(start),
        end_time: DateUtils.formatTime(end)
      });
    } catch (err) {
      this.goBack();
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit() {
    this.serverErrors.set([]);
    if (this.form.invalid) return;

    this.isLoading.set(true);
    const val = this.form.value;
    
    const startAt = DateUtils.combineDateTime(val.date, val.start_time);
    const endAt = DateUtils.combineDateTime(val.date, val.end_time);

    const payload = {
      ...val,
      start_at: startAt,
      end_at: endAt
    };

    try {
      if (this.isEditMode() && this.performanceId) {
        await firstValueFrom(this.performanceService.updatePerformance(this.performanceId, payload));
      } else {
        await firstValueFrom(this.performanceService.createPerformance(payload));
      }
      this.goBack();
    } catch (err) {
      this.serverErrors.set(this.errorHandler.parseRailsErrors(err));
    } finally {
      this.isLoading.set(false);
    }
  }
}