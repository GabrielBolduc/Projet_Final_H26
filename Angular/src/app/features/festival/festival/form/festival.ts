import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; 
import { firstValueFrom } from 'rxjs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'; 
import { FestivalService } from '../../../../core/services/festival.service';
import { ErrorHandlerService } from '../../../../core/services/error-handler.service';

const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const start = control.get('start_at')?.value;
  const end = control.get('end_at')?.value;

  if (start && end && start > end) {
    return { dateRangeInvalid: true };
  }
  return null;
};

@Component({
  selector: 'app-festival-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    MatSnackBarModule
  ],
  templateUrl: './festival.html',
  styleUrls: ['./festival.css']
})
export class FestivalFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private festivalService = inject(FestivalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private errorHandler = inject(ErrorHandlerService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  minDate = new Date();

  festivalForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    status: ['draft', [Validators.required]],
    start_at: ['', [Validators.required]],
    end_at: ['', [Validators.required]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(250)]],
    daily_capacity: [0, [Validators.required, Validators.min(1), Validators.max(1000000)]],
    latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]], 
    longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]] 
  }, { validators: dateRangeValidator });

  isEditMode = signal(false);
  isLoading = signal(false);
  serverErrors = signal<string[]>([]);
  festivalId: number | null = null;

  get statusOptions() {
    return [
      { value: 'draft', label: this.translate.instant('FESTIVAL.DRAFT') },
      { value: 'ongoing', label: this.translate.instant('FESTIVAL.ONGOING') }
    ];
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.festivalId = Number(id);
      this.loadFestival();
    }
  }

  async loadFestival() {
    if (!this.festivalId) return;
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.festivalService.getFestival(this.festivalId));
      
      this.festivalForm.patchValue({
        ...data,
        start_at: data.start_at ? new Date(data.start_at) : null,
        end_at: data.end_at ? new Date(data.end_at) : null
      });

    } catch (err) {
      this.snackBar.open(
        this.translate.instant('FESTIVAL.LOAD_ERROR'), 
        this.translate.instant('COMMON.CLOSE'), 
        { duration: 4000 }
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit() {
    if (this.festivalForm.invalid) return;

    this.isLoading.set(true);
    this.serverErrors.set([]);

    try {
      if (this.isEditMode() && this.festivalId) {
        await firstValueFrom(this.festivalService.updateFestival(this.festivalId, this.festivalForm.value));
        this.snackBar.open(
          this.translate.instant('FESTIVAL.UPDATE_SUCCESS'), 
          this.translate.instant('COMMON.CLOSE'), 
          { duration: 3000 }
        );
      } else {
        await firstValueFrom(this.festivalService.createFestival(this.festivalForm.value));
        this.snackBar.open(
          this.translate.instant('FESTIVAL.CREATE_SUCCESS'), 
          this.translate.instant('COMMON.CLOSE'), 
          { duration: 3000 }
        );
      }
      this.router.navigate(['/admin/festivals']);
    } catch (err) {
      const errors = this.errorHandler.parseRailsErrors(err);
      this.serverErrors.set(errors);
      
      const errorMessage = errors.length > 0 ? errors[0] : this.translate.instant('FESTIVAL.SAVE_ERROR');
      this.snackBar.open(
        errorMessage, 
        this.translate.instant('COMMON.UNDERSTOOD'), 
        { duration: 6000 }
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}