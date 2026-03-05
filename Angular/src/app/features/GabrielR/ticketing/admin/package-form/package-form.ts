import { Component, inject, OnInit, signal, computed, effect, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

import { FestivalService } from '../../../../../core/services/festival.service';
import { ErrorHandlerService } from '@core/services/error-handler.service';
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

    if (start > end) {
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
    MatIconModule, MatProgressBarModule, MatDividerModule, TranslateModule
  ],
  templateUrl: './package-form.html',
  styleUrl: './package-form.css'
})
export class PackageFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  
  private festivalService = inject(FestivalService);
  private errorHandler = inject(ErrorHandlerService);
  private packageService = inject(PackageService); 
  private translate = inject(TranslateService);

  festivalCapacity = signal<number | null>(null);
  festivalStartLimit = signal<Date | null>(null);
  festivalEndLimit = signal<Date | null>(null);
  existingPackages = signal<Package[]>([]);
  soldCount = signal<number>(0);

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(100)]],
    price: [0, [Validators.required, Validators.min(0)]],
    quota: [100, [Validators.required]],
    category: ['general', Validators.required],
    valid_date: [null, Validators.required],
    valid_time: ['', Validators.required],
    expired_date: [null, Validators.required],
    expired_time: ['', Validators.required],
    festival_id: [null, Validators.required],
    discount_min_quantity: [null],
    discount_rate: [null]
  }, { 
    validators: [dateRangeValidator, this.festivalBoundsValidator(), this.categoryDateValidator(), this.discountValidator()] 
  });

  formValidDate = toSignal(this.form.get('valid_date')!.valueChanges, { initialValue: this.form.get('valid_date')!.value });
  formExpiredDate = toSignal(this.form.get('expired_date')!.valueChanges, { initialValue: this.form.get('expired_date')!.value });
  formCategory = toSignal(this.form.get('category')!.valueChanges, { initialValue: this.form.get('category')!.value });

  festivalDurationInDays = computed(() => {
    const start = this.festivalStartLimit();
    const end = this.festivalEndLimit();
    if (!start || !end) return 1;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  });

  maxAllowedQuota = computed(() => {
    const cap = this.festivalCapacity();
    const category = this.formCategory();
    const validDate = this.formValidDate();
    const expiredDate = this.formExpiredDate();
    
    if (cap === null || !validDate || !expiredDate) return cap;

    if (category === 'general') {
      const totalCapacity = cap * this.festivalDurationInDays();
      const otherGeneralQuota = this.existingPackages()
        .filter(p => p.id !== this.packageId && p.category.toLowerCase() === 'general')
        .reduce((sum, p) => sum + (p.quota || 0), 0);
      
      return Math.max(0, totalCapacity - otherGeneralQuota);
    } else {
      const otherNonGeneralPackages = this.existingPackages()
        .filter(p => p.id !== this.packageId && p.category.toLowerCase() !== 'general');

      const start = new Date(validDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(expiredDate);
      end.setHours(0, 0, 0, 0);

      const daysToCheck: Date[] = [];
      if (category === 'evening') {
        daysToCheck.push(new Date(start));
      } else {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          daysToCheck.push(new Date(d));
        }
      }

      const packageConsumesDay = (pkg: Package, day: Date): boolean => {
        const pkgCategory = pkg.category.toLowerCase();
        const pkgStart = new Date(pkg.valid_at);
        pkgStart.setHours(0, 0, 0, 0);
        const pkgEnd = new Date(pkg.expired_at);
        pkgEnd.setHours(0, 0, 0, 0);

        if (pkgCategory === 'evening') {
          return day.getTime() === pkgStart.getTime();
        }

        return day >= pkgStart && day <= pkgEnd;
      };

      let minRemaining = cap;

      for (const currentDate of daysToCheck) {
        const dailySum = otherNonGeneralPackages.reduce((sum, p) => (
          packageConsumesDay(p, currentDate) ? sum + (p.quota || 0) : sum
        ), 0);

        minRemaining = Math.min(minRemaining, cap - dailySum);
      }
      return Math.max(0, minRemaining);
    }
  });

  selectedFile: File | null = null;
  previewUrl = signal<string | null>(null);
  existingImageUrl = signal<string | null>(null);
  fileError = signal<string | null>(null);
  displayImageUrl = computed(() => this.previewUrl() ?? this.existingImageUrl());
  
  isEditMode = signal(false);
  packageId: number | null = null;
  isLoading = signal(false);
  serverErrors = signal<string[]>([]);

  constructor() {
    effect(() => {
      this.updateQuotaValidators();
    });
  }

  async ngOnInit(): Promise<void> {
    this.form.get('category')?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.form.updateValueAndValidity();
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.packageId = +id;
      await this.loadPackageData(this.packageId);
    } else {
      await this.loadFestivalData();
    }
  }

  private async loadPackageData(id: number): Promise<void> {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.packageService.getPackage(id));
      const validAt = new Date(data.valid_at);
      const expiredAt = new Date(data.expired_at);
      
      this.existingImageUrl.set(data.image_url ?? null);
      this.soldCount.set(data.sold ?? 0);

      this.form.patchValue({
        title: data.title,
        description: data.description,
        price: data.price,
        quota: data.quota,
        category: data.category.toLowerCase(),
        festival_id: data.festival_id,
        valid_date: validAt,
        valid_time: DateUtils.formatTime(validAt),
        expired_date: expiredAt,
        expired_time: DateUtils.formatTime(expiredAt),
        discount_min_quantity: data.discount_min_quantity ?? null,
        discount_rate: data.discount_rate ? Number(data.discount_rate) * 100 : null
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

      if (!festival) return;

      const pkgs = await firstValueFrom(this.packageService.getPackages({ festivalId: festival.id }));
      this.existingPackages.set(pkgs);

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

    if (festival.daily_capacity !== undefined && festival.daily_capacity !== null) {
      this.festivalCapacity.set(festival.daily_capacity);
    } else {
      this.festivalCapacity.set(null);
    }

    this.updateQuotaValidators();
  }

  private updateQuotaValidators(): void {
    const quotaControl = this.form?.get('quota');
    if (!quotaControl) return;

    const min = Math.max(1, this.soldCount());
    const max = this.maxAllowedQuota() ?? 999999;

    quotaControl.setValidators([
      Validators.required, 
      Validators.min(min), 
      Validators.max(max),
      this.integerValidator()
    ]);
    quotaControl.updateValueAndValidity({ emitEvent: false });
  }

  private integerValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') return null;

      return Number.isInteger(Number(value)) ? null : { integerInvalid: true };
    };
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

  private categoryDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const category = control.get('category')?.value;
      const vDate = control.get('valid_date')?.value;
      const vTime = control.get('valid_time')?.value;
      const eDate = control.get('expired_date')?.value;
      const eTime = control.get('expired_time')?.value;

      if (!category || !vDate || !vTime || !eDate || !eTime) return null;

      const start = new Date(vDate);
      const [sHours, sMinutes] = vTime.split(':').map(Number);
      start.setHours(sHours, sMinutes, 0);

      const end = new Date(eDate);
      const [eHours, eMinutes] = eTime.split(':').map(Number);
      end.setHours(eHours, eMinutes, 0);

      const sHourDec = sHours + sMinutes / 60;
      const eHourDec = eHours + eMinutes / 60;

      switch (category) {
        case 'general':
          if (vTime !== '00:00') {
            return { generalStartInvalid: true };
          }
          if (eTime !== '23:59') {
            return { generalEndInvalid: true };
          }
          break;
        case 'daily':
          if (start.toDateString() !== end.toDateString()) {
            return { dailyDurationInvalid: true };
          }
          if (sHourDec < 6 || eHourDec > 18) {
            return { dailyHoursInvalid: true };
          }
          break;
        case 'evening':
          const isSameDay = start.toDateString() === end.toDateString();
          const nextDay = new Date(start);
          nextDay.setDate(nextDay.getDate() + 1);
          const isNextDay = end.toDateString() === nextDay.toDateString();

          if (!isSameDay && !isNextDay) {
            return { eveningDurationInvalid: true };
          }
          if (isSameDay && vTime === '00:00' && eTime === '23:59') {
            return { eveningFullDayInvalid: true };
          }
          if (sHourDec < 18) {
            return { eveningStartInvalid: true };
          }
          if (isNextDay && eHourDec > 6) {
            return { eveningEndInvalid: true };
          }
          break;
      }

      return null;
    };
  }

  private discountValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const minQty = control.get('discount_min_quantity')?.value;
      const rate = control.get('discount_rate')?.value;
      const bothSet = minQty !== null && minQty !== '' && rate !== null && rate !== '';
      const neitherSet = (minQty === null || minQty === '') && (rate === null || rate === '');
      if (!bothSet && !neitherSet) {
        return { discountIncomplete: true };
      }
      return null;
    };
  }

  private parseDateWithoutTimezone(dateInput: string | Date): Date {
    if (dateInput instanceof Date) {
      return new Date(dateInput.getFullYear(), dateInput.getMonth(), dateInput.getDate());
    }
    const parts = dateInput.toString().split('T')[0].split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.fileError.set(null);

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.selectedFile = null;
        this.previewUrl.set(null);
        this.fileError.set(this.translate.instant('PACKAGE_FORM.IMAGE_TYPE_INVALID'));
        input.value = '';
        return;
      }

      const maxBytes = 5 * 1024 * 1024;
      if (file.size > maxBytes) {
        this.selectedFile = null;
        this.previewUrl.set(null);
        this.fileError.set(this.translate.instant('PACKAGE_FORM.IMAGE_SIZE_INVALID'));
        input.value = '';
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => { this.previewUrl.set(reader.result as string); };
      reader.readAsDataURL(file);
    }
  }

  async onSubmit(): Promise<void> {
    this.serverErrors.set([]);
    this.form.markAllAsTouched();

    if (this.fileError()) return;
    if (this.form.invalid) return;

    this.isLoading.set(true);
    try {
      const val = this.form.getRawValue();
      const packageData: Partial<Package> = {
        title: val.title,
        description: val.description,
        price: val.price,
        quota: val.quota,
        category: val.category.toUpperCase(),
        festival_id: val.festival_id,
        valid_at: DateUtils.combineDateTime(val.valid_date, val.valid_time),
        expired_at: DateUtils.combineDateTime(val.expired_date, val.expired_time),
        discount_min_quantity: val.discount_min_quantity || null,
        discount_rate: val.discount_rate ? val.discount_rate / 100 : null
      };

      if (this.isEditMode() && this.packageId) {
        await firstValueFrom(this.packageService.updatePackage(this.packageId, packageData, this.selectedFile || undefined));
      } else {
        await firstValueFrom(this.packageService.createPackage(packageData, this.selectedFile || undefined));
      }
      this.router.navigate(['/admin/ticketing']);
    } catch (err: any) {
      this.serverErrors.set(this.errorHandler.parseRailsErrors(err));
    } finally {
      this.isLoading.set(false);
    }
  }
}
