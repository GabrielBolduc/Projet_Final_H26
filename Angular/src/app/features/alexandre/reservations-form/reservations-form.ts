import { Component, signal, inject, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { AuthService } from '@core/services/auth.service';
import { ReservationsService } from '@core/services/reservation.service';
import { AccommodationsService } from '@core/services/accommodations.service'; 
import { UnitsService } from '@core/services/units.service';
import { FestivalService } from '@core/services/festival.service';
import { Unit, UnitCapacity, UnitType } from '@core/models/unit';
import { ApiResponse } from '@core/models/api-response';

@Component({
  selector: 'app-reservations-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatOptionModule, MatButtonModule, 
    MatDatepickerModule, MatNativeDateModule, MatIconModule, 
    TranslateModule, RouterLink, CurrencyPipe
  ],
  templateUrl: './reservations-form.html',
  styleUrl: './reservations-form.css'
})
export class ReservationsForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute); 
  private router = inject(Router);        
  private service: ReservationsService = inject(ReservationsService);
  private accService = inject(AccommodationsService);
  private unitsService: UnitsService = inject(UnitsService);
  private festivalService: FestivalService = inject(FestivalService);
  private authService = inject(AuthService);

  reservationId = signal<number | null>(null);
  units = signal<Unit[]>([]);
  accommodationName = signal<string>('');
  
  isEditMode = signal(false);
  isLoading = signal(false);
  serverErrors = signal<string[]>([]);
  minDate = signal<Date | null>(null);
  maxDate = signal<Date | null>(null);
  reservedDates = signal<Set<number>>(new Set());
  startAtDate = signal<Date>(new Date());
  private params = toSignal(this.route.paramMap);
  private queryParams = toSignal(this.route.queryParamMap);

  private dateRangeValidator = (group: AbstractControl): ValidationErrors | null => {
    const start = group.get('arrival_at')?.value;
    const end = group.get('departure_at')?.value;

    if (!start || !end) return null;

    const startDate = new Date(start).setHours(0, 0, 0, 0);
    const endDate = new Date(end).setHours(0, 0, 0, 0);

    if (startDate >= endDate) return { dateRangeInvalid: true };

    const current = new Date(startDate);
    const reserved = this.reservedDates();

    while (current < new Date(endDate)) {
      if (reserved.has(current.getTime())) {
        return { rangeContainsReserved: true };
      }
      current.setDate(current.getDate() + 1);
    }
    return null;
  };
  
  form: FormGroup = this.fb.group({
    reservation_name: ['', [
      Validators.required, 
      Validators.maxLength(100)
    ]],
    phone_number: ['', [
      Validators.required, 
      Validators.maxLength(20)
    ]],
    nb_of_people: [1, [Validators.required, Validators.min(1)]],
    arrival_at: [null, [Validators.required]],
    departure_at: [null, [Validators.required]],
    unit_id: [null, [Validators.required]]
  }, { validators: this.dateRangeValidator });

  fillWithMyInfo() {
    const user = this.authService.currentUser();
    if (user) {
      this.form.patchValue({
        reservation_name: user.name,
        phone_number: user.phone_number
      });
    }
  }

  formatUnitType(type: string): string {
    if (!type) return '';
    return type.includes('::') ? type.split('::')[1] : type;
  }

  constructor() {
    this.loadFestivalData();

    effect(() => {
      const id = this.params()?.get('id');
      const qParams = this.queryParams();
      
      const fromResId = qParams?.get('from_reservation');
      const accId = qParams?.get('accommodationId');
      const preSelectedUnitId = qParams?.get('unit_id');

      if (id) {
        this.isEditMode.set(true);
        this.reservationId.set(+id);
        this.loadReservation(+id);
      } else if (fromResId) {
        this.loadContextFromExistingReservation(+fromResId);
      } else if (accId) {
        this.loadUnits(+accId, preSelectedUnitId ? +preSelectedUnitId : undefined);
      }
    }, { allowSignalWrites: true });

    this.setupFormSubscriptions();
  }

  private setupFormSubscriptions() {
    this.form.get('unit_id')?.valueChanges.subscribe((unitId: number) => {
      if (unitId) {
        this.updateUnitCapacity(unitId);
        this.loadReservedDates(unitId);
      }
    });
  }

private loadReservedDates(unitId: number) {
  this.service.list({ unit_id: unitId }).subscribe({
    next: (res) => {
      const dates = new Set<number>();
      res.data.forEach(booking => {
        if (booking.id === this.reservationId()) return;

        let current = new Date(booking.arrival_at + 'T00:00:00');
        const end = new Date(booking.departure_at + 'T00:00:00');
        
        while (current < end) { 
          dates.add(new Date(current).setHours(0, 0, 0, 0));
          current.setDate(current.getDate() + 1);
        }
      });
      this.reservedDates.set(dates);
    }
  });
}

  private loadContextFromExistingReservation(resId: number) {
    this.isLoading.set(true);
    this.service.get(resId).subscribe({
      next: (response: any) => {

        const res = response.data; 

        if (res) {
          this.form.patchValue({
            reservation_name: res.reservation_name,
            phone_number: res.phone_number
          });

          const accId = res.unit?.accommodation_id || res.accommodation_id;
          if (accId) {
            this.loadUnits(accId);
          }
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.handleError(err);
        this.isLoading.set(false);
      }
    });
  }

dateFilter = (date: Date | null): boolean => {
  if (!date) return false;

  const time = new Date(date).setHours(0, 0, 0, 0);

  if (this.minDate() && time < this.minDate()!.getTime()) return false;
  if (this.maxDate() && time > this.maxDate()!.getTime()) return false;

  const isReserved = this.reservedDates().has(time);
  return !isReserved;
};

  private updateUnitCapacity(unitId: number) {
    const unit = this.units().find(u => u.id === unitId);
    if (unit) {
      const typeKey = this.formatUnitType(unit.type) as UnitType;
      const maxAllowed = UnitCapacity[typeKey] || 1;

      const peopleCtrl = this.form.get('nb_of_people');
      if (peopleCtrl && peopleCtrl.value > maxAllowed) {
        peopleCtrl.patchValue(maxAllowed);
      }
      peopleCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(maxAllowed)]);
      peopleCtrl?.updateValueAndValidity();
    }
  }

  private loadUnits(accId: number, unitIdToSelect?: number) {
    this.isLoading.set(true);
    
    this.accService.getAccommodation(accId).subscribe({
      next: (acc) => this.accommodationName.set(acc.name)
    });

    this.unitsService.getUnitsByAccommodation(accId).subscribe({
      next: (res: ApiResponse<Unit[]>) => {
        this.units.set(res.data);
        
        if (unitIdToSelect) {
          this.form.get('unit_id')?.setValue(unitIdToSelect);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

private loadReservation(id: number) {
  this.isLoading.set(true);
  this.service.get(id).subscribe({
    next: (response: any) => {
      const res = response.data || response;
      
      if (!res || typeof res !== 'object') {
        console.error('Reservation data missing in response:', response);
        this.isLoading.set(false);
        return;
      }

      console.log('Patching form with:', res);

      this.form.patchValue({
        reservation_name: res.reservation_name || '',
        phone_number: res.phone_number || '',
        nb_of_people: res.nb_of_people || 1,
        arrival_at: res.arrival_at ? new Date(res.arrival_at + 'T00:00:00') : null,
        departure_at: res.departure_at ? new Date(res.departure_at + 'T00:00:00') : null
      }, { emitEvent: false });

      const accId = res.unit?.accommodation_id || res.accommodation_id;
      if (accId) {
        this.loadUnits(accId, res.unit_id); 
      }
      
      if (res.unit_id) this.loadReservedDates(res.unit_id);
      this.isLoading.set(false);
    },
    error: (err) => {
      console.error('Failed to load reservation:', err);
      this.handleError(err);
    }
  });
}

  private loadFestivalData() {
    this.festivalService.getCurrentFestival().subscribe({
      next: (festival) => {
        if (festival) {
          const start = new Date(festival.start_at);
          const end = new Date(festival.end_at);

          const min = new Date(start);
          min.setDate(min.getDate() - 3);
          
          const max = new Date(end);
          max.setDate(max.getDate() + 3);

          this.minDate.set(min);
          this.maxDate.set(max);

          this.startAtDate.set(min);
        }
      }
    });
  }

  private handleError(err: any) {
    this.isLoading.set(false);

    const apiError = err.error || err; 

    if (apiError.errors) {
      const messages = Object.entries(apiError.errors)
        .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`);
      this.serverErrors.set(messages);
    } else if (apiError.message) {
      this.serverErrors.set([apiError.message]);
    } else {
      this.serverErrors.set(['An unexpected error occurred']);
    }
  }

  private getCleanType(typeStr: string): UnitType {
    const parts = typeStr.split('::');
    return (parts.length > 1 ? parts[1] : parts[0]) as UnitType;
  }

  get maxPeopleForSelectedUnit(): number {
    const selectedId = this.form.get('unit_id')?.value;
    if (!selectedId) return 10;

    const unit = this.units().find(u => u.id === selectedId);
    if (!unit) return 10;

    const cleanType = this.getCleanType(unit.type);
    return UnitCapacity[cleanType] || 10;
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);

      const formValue = this.form.getRawValue();
      
      const payload = {
        ...formValue,
        arrival_at: this.formatDateForRails(formValue.arrival_at),
        departure_at: this.formatDateForRails(formValue.departure_at)
      };

      const id = this.reservationId();
      const request = this.isEditMode() 
        ? this.service.update(id!, payload) 
        : this.service.create(payload);

      request.subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/reservations']);
        },
        error: (err: any) => this.handleError(err)
      });
    }
  }

  private formatDateForRails(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
  }
}
