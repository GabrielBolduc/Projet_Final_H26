import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { FestivalService } from '../../../../../core/services/festival.service';
import { PackageService } from '../../../../../core/services/package.service';
import { Festival } from '@core/models/festival';
import { Package } from '@core/models/package';
import { DateUtils } from '@core/utils/date.utils';

const dateRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const validDate = control.get('valid_date')?.value;
  const validTime = control.get('valid_time')?.value;
  const expiredDate = control.get('expired_date')?.value;
  const expiredTime = control.get('expired_time')?.value;

  if (validDate && validTime && expiredDate && expiredTime) {
    const start = new Date(validDate);
    const [sHours, sMinutes] = validTime.split(':').map(Number);
    start.setHours(sHours, sMinutes, 0);

    const end = new Date(expiredDate);
    const [eHours, eMinutes] = expiredTime.split(':').map(Number);
    end.setHours(eHours, eMinutes, 0);

    if (start >= end) {
      return { dateRangeInvalid: true };
    }
  }
  return null;
};

@Component({
  selector: 'app-package-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, 
    MatDatepickerModule, MatNativeDateModule, MatButtonModule, 
    MatIconModule, MatProgressBarModule, TranslateModule
  ],
  templateUrl: './package-form.html',
  styleUrls: ['./package-form.css']
})
export class PackageFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  private festivalService = inject(FestivalService);
  private packageService = inject(PackageService); 
  private translate = inject(TranslateService);

  form!: FormGroup;
  selectedFile: File | null = null;
  previewUrl = signal<string | null>(null);
  existingImageUrl = signal<string | null>(null);

  displayImageUrl = computed(() => this.previewUrl() ?? this.existingImageUrl());
  
  isEditMode = signal(false);
  packageId: number | null = null;
  isLoading = signal(false);
  serverErrors = signal<string[]>([]);

  festivalCapacity = signal<number | null>(null);
  festivalStartLimit = signal<Date | null>(null);
  festivalEndLimit = signal<Date | null>(null);

  async ngOnInit(): Promise<void> {
    this.initForm();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.packageId = +id;
      await this.loadPackageData(this.packageId);
    } else {
      await this.loadFestivalData();
    }
  }

  private initForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(50)]],
      description: ['', [Validators.maxLength(100)]],
      price: [0, [Validators.required, Validators.min(0)]],
      quota: [100, [Validators.required, Validators.min(1)]],
      category: ['general', Validators.required],

      valid_date: [null, Validators.required],
      valid_time: ['', Validators.required],
      
      expired_date: [null, Validators.required],
      expired_time: ['', Validators.required],

      festival_id: [null, Validators.required]
    }, { 
      validators: [dateRangeValidator, this.festivalBoundsValidator()] 
    });
  }

  private async loadPackageData(id: number): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.packageService.getPackage(id));
      const validAt = new Date(data.valid_at);
      const expiredAt = new Date(data.expired_at);
      
      this.existingImageUrl.set(data.image_url ?? null);

      this.form.patchValue({
        title: data.title,
        description: data.description,
        price: data.price,
        quota: data.quota,
        category: data.category,
        festival_id: data.festival_id,
        valid_date: validAt,
        valid_time: DateUtils.formatTime(validAt),
        expired_date: expiredAt,
        expired_time: DateUtils.formatTime(expiredAt)
      });

      await this.loadFestivalData(data.festival_id);
    } catch {
      this.router.navigate(['/admin/ticketing']);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadFestivalData(festivalId?: number): Promise<void> {
    try {
      const festival = festivalId
        ? await firstValueFrom(this.festivalService.getFestival(festivalId))
        : await this.getCurrentFestival();

      if (!festival) {
        console.error("ERREUR : Aucun festival en cours n'a été trouvé.");
        return;
      }

      this.applyFestivalConstraints(festival);
    } catch {
      console.error("ERREUR : Impossible de charger le festival.");
    }
  }

  private async getCurrentFestival(): Promise<Festival | null> {
    const festivals = await firstValueFrom(this.festivalService.getFestivals('ongoing'));
    return festivals[0] ?? null;
  }

  private applyFestivalConstraints(festival: Festival): void {
    this.form.patchValue({ festival_id: festival.id });

    const fStart = this.parseDateWithoutTimezone(festival.start_at);
    fStart.setHours(0, 0, 0, 0);
    this.festivalStartLimit.set(fStart);

    const fEnd = this.parseDateWithoutTimezone(festival.end_at);
    fEnd.setHours(23, 59, 59, 999);
    this.festivalEndLimit.set(fEnd);

    if (!this.isEditMode()) {
      this.form.patchValue({
        valid_date: fStart,
        valid_time: '00:00',
        expired_date: fEnd,
        expired_time: '23:59'
      });
    }

    const quotaControl = this.form.get('quota');
    if (festival.daily_capacity !== undefined && festival.daily_capacity !== null) {
      this.festivalCapacity.set(festival.daily_capacity);
      quotaControl?.setValidators([
        Validators.required, Validators.min(1), Validators.max(festival.daily_capacity)
      ]);
    } else {
      this.festivalCapacity.set(null);
      quotaControl?.setValidators([Validators.required, Validators.min(1)]);
    }

    quotaControl?.updateValueAndValidity({ emitEvent: false });
    this.form.updateValueAndValidity();
  }

  private festivalBoundsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fStart = this.festivalStartLimit();
      const fEnd = this.festivalEndLimit();
      
      if (!fStart || !fEnd) return null; 

      const vDate = control.get('valid_date')?.value;
      const vTime = control.get('valid_time')?.value;
      const eDate = control.get('expired_date')?.value;
      const eTime = control.get('expired_time')?.value;

      if (!vDate || !vTime || !eDate || !eTime) return null;

      const start = new Date(vDate);
      const [sHours, sMinutes] = vTime.split(':').map(Number);
      start.setHours(sHours, sMinutes, 0);

      const end = new Date(eDate);
      const [eHours, eMinutes] = eTime.split(':').map(Number);
      end.setHours(eHours, eMinutes, 0);

      const errors: any = {};
      let hasError = false;

      if (start < fStart) {
        errors.validBeforeFestival = true;
        hasError = true;
      }
      
      if (end > fEnd) {
        errors.expiredAfterFestival = true;
        hasError = true;
      }

      return hasError ? errors : null;
    };
  }

  private parseDateWithoutTimezone(dateInput: string | Date): Date {
    if (dateInput instanceof Date) {
      return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
    }

    const parts = dateInput.toString().split('T')[0].split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => { this.previewUrl.set(reader.result as string); };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit(): Promise<void> {
    this.serverErrors.set([]);

    if (this.form.invalid) {
      return;
    }

    this.isLoading.set(true);

    try {
      const val = this.form.getRawValue();

      const validAtFull = DateUtils.combineDateTime(val.valid_date, val.valid_time);
      const expiredAtFull = DateUtils.combineDateTime(val.expired_date, val.expired_time);

      const packageData: Partial<Package> = {
        title: val.title,
        description: val.description,
        price: val.price,
        quota: val.quota,
        category: val.category,
        festival_id: val.festival_id,
        valid_at: validAtFull,
        expired_at: expiredAtFull
      };

      if (this.isEditMode() && this.packageId) {
        await firstValueFrom(this.packageService.updatePackage(this.packageId, packageData, this.selectedFile || undefined));
      } else {
        await firstValueFrom(this.packageService.createPackage(packageData, this.selectedFile || undefined));
      }

      this.router.navigate(['/admin/ticketing']);
    } catch (err: any) {
      const responseErrors = err?.error?.errors ?? err?.errors;
      if (responseErrors && typeof responseErrors === 'object') {
        const errorsArray: string[] = [];

        Object.keys(responseErrors).forEach(key => {
          const fieldErrors = responseErrors[key];

          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach((msg: string) => errorsArray.push(`${key}: ${msg}`));
          } else if (fieldErrors) {
            errorsArray.push(`${key}: ${fieldErrors}`);
          }
        });

        this.serverErrors.set(errorsArray.length > 0 ? errorsArray : [this.translate.instant('PACKAGE_FORM.GENERIC_ERROR')]);
      } else {
        this.serverErrors.set([this.translate.instant('PACKAGE_FORM.GENERIC_ERROR')]);
      }
    } finally {
      this.isLoading.set(false);
    }
  }
}
