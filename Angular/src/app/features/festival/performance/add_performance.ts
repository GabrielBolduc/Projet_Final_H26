import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

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
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatIconModule,
    TranslateModule
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
    this.loadDropdowns();

    // On utilise bien "perfId" défini dans tes routes !
    const id = this.route.snapshot.paramMap.get('perfId');

    if (id) {
      this.isEditMode.set(true);
      this.performanceId = +id;
      this.loadPerformanceData(this.performanceId);
    }
  }

  loadDropdowns() {
    this.artistService.getArtists().subscribe(data => this.artists.set(data));
    this.stageService.getStages().subscribe(data => this.stages.set(data));
    
    this.festivalService.getFestivals().subscribe(data => {
      const activeFestivals = data.filter(f => f.status !== 'completed');
      this.festivals.set(activeFestivals);

      if (this.isEditMode() && this.performanceId) {
        this.checkCurrentFestivalVisibility(data);
      }
    });
  }

  private checkCurrentFestivalVisibility(allFestivals: Festival[]) {
    this.performanceService.getPerformance(this.performanceId!).subscribe({
      next: (perf) => {
        const currentFestId = perf.festival?.id || perf.festival_id;
        const isInList = this.festivals().find(f => f.id === currentFestId);
        
        if (!isInList) {
          const oldFestival = allFestivals.find(f => f.id === currentFestId);
          if (oldFestival) {
            this.festivals.update(list => [...list, oldFestival]);
          }
        }
      },
      error: () => {
      }
    });
  }

  loadPerformanceData(id: number) {
    this.isLoading.set(true);
    this.performanceService.getPerformance(id).subscribe({
      next: (data) => {
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
          start_time: DateUtils.formatTime(start), // Utilisation de DateUtils
          end_time: DateUtils.formatTime(end)      // Utilisation de DateUtils
        });
        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/admin/dashboard'])
    });
  }

  onSubmit() {
    this.serverErrors.set([]);

    if (this.form.invalid) return;

    this.isLoading.set(true);
    const val = this.form.value;
    
    // Utilisation de DateUtils
    const startAt = DateUtils.combineDateTime(val.date, val.start_time);
    const endAt = DateUtils.combineDateTime(val.date, val.end_time);

    const payload = {
      ...val,
      start_at: startAt,
      end_at: endAt
    };

    const request$ = (this.isEditMode() && this.performanceId)
      ? this.performanceService.updatePerformance(this.performanceId, payload)
      : this.performanceService.createPerformance(payload);

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        
        this.serverErrors.set(this.errorHandler.parseRailsErrors(err));
      }
    });
  }
}