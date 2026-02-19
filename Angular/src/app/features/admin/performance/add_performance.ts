import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { PerformanceService } from '../../../core/services/performance.service';
import { ArtistService } from '../../../core/services/artist.service';
import { StageService } from '../../../core/services/stage.service';
import { FestivalService } from '../../../core/services/festival.service';

import { Artist } from '../../../core/models/artist';
import { Stage } from '../../../core/models/stage';
import { Festival } from '../../../core/models/festival';

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
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatIconModule
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
  private translate = inject(TranslateService);

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

    const id = this.route.snapshot.paramMap.get('id');
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
    this.performanceService.getPerformance(this.performanceId!).subscribe(perf => {
      const currentFestId = perf.festival?.id || perf.festival_id;
      const isInList = this.festivals().find(f => f.id === currentFestId);
      
      if (!isInList) {
        const oldFestival = allFestivals.find(f => f.id === currentFestId);
        if (oldFestival) {
          this.festivals.update(list => [...list, oldFestival]);
        }
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
          start_time: this.formatTime(start),
          end_time: this.formatTime(end)
        });
        this.isLoading.set(false);
      },
      error: () => this.router.navigate(['/dashboard'])
    });
  }

  onSubmit() {
    this.serverErrors.set([]);

    if (this.form.invalid) return;

    this.isLoading.set(true);
    const val = this.form.value;
    
    const startAt = this.combineDateTime(val.date, val.start_time);
    const endAt = this.combineDateTime(val.date, val.end_time);

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
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        
        if (err.status === 422) {
          const railsErrors = err.error?.errors || err.error?.data || err.error;
          const translatedErrorsList: string[] = [];

          if (railsErrors && typeof railsErrors === 'object') {
            Object.keys(railsErrors).forEach(field => {
              
              // mettre en forme nom du champ 
              const fieldName = field !== 'base' ? `${field.toUpperCase()} : ` : '';

              if (Array.isArray(railsErrors[field])) {
                railsErrors[field].forEach((errorCode: string) => {
                  const translationKey = `SERVER_ERRORS.${errorCode}`;
                  const translatedMessage = this.translate.instant(translationKey);
                  
                  // si traduction echoue affiche code erreur brut
                  const finalMessage = translatedMessage === translationKey ? errorCode : translatedMessage;
                  translatedErrorsList.push(`${fieldName}${finalMessage}`);
                });
              } else if (typeof railsErrors[field] === 'string') {
                 const errorCode = railsErrors[field];
                 const translationKey = `SERVER_ERRORS.${errorCode}`;
                 const translatedMessage = this.translate.instant(translationKey);
                 const finalMessage = translatedMessage === translationKey ? errorCode : translatedMessage;
                 translatedErrorsList.push(`${fieldName}${finalMessage}`);
              }
            });
            this.serverErrors.set(translatedErrorsList);
          } else {
            this.serverErrors.set(["Invalid data."]);
          }
        } else if (err.status === 500) {
          this.serverErrors.set(["Erreur interne du serveur Rails."]);
        } else {
          this.serverErrors.set([`Une erreur est survenue (Code: ${err.status}).`]);
        }
      }
    });
  }

  private formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5);
  }

  private combineDateTime(date: Date, time: string): string {
    const d = new Date(date);
    const [hours, minutes] = time.split(':');
    d.setHours(+hours);
    d.setMinutes(+minutes);
    d.setSeconds(0);
    return d.toISOString();
  }
}