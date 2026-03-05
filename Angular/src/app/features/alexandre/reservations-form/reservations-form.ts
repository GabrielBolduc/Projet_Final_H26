import { Component, signal, OnInit, inject } from '@angular/core';
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
export class ReservationsForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute); 
  private router = inject(Router);        
  private service: ReservationsService = inject(ReservationsService);
  private unitsService: UnitsService = inject(UnitsService);
  private festivalService: FestivalService = inject(FestivalService);
  private authService = inject(AuthService);

  reservationId = signal<number | null>(null);
  units = signal<Unit[]>([]);
  
  isEditMode = signal(false);
  isLoading = signal(false);
  serverErrors = signal<string[]>([]);
  minDate = signal<Date | null>(null);
  maxDate = signal<Date | null>(null);
  reservedDates = signal<Set<number>>(new Set());
  startAtDate = signal<Date>(new Date());
  
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

  ngOnInit(): void {
    this.loadFestivalData();

    const id = this.route.snapshot.paramMap.get('id');
    const accId = this.route.snapshot.queryParamMap.get('accommodationId');

    if (id) {
      this.isEditMode.set(true);
      this.reservationId.set(+id);
      this.loadReservation(+id);
    } else if (accId) {
      this.loadUnits(+accId);
    }

    this.form.get('unit_id')?.valueChanges.subscribe((unitId: number) => {
      if (unitId) {
        if (this.form.get('unit_id')?.dirty) {
          this.form.patchValue({
            arrival_at: null,
            departure_at: null
          }, { emitEvent: false });
        }

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
      console.log('Blocked Timestamps:', Array.from(dates));
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

  private loadUnits(accId: number) {
    this.isLoading.set(true);
    this.unitsService.getUnitsByAccommodation(accId).subscribe({
      next: (res: ApiResponse<Unit[]>) => {
        this.units.set(res.data);
        this.isLoading.set(false);
      },
      error: (err: Error) => this.handleError(err)
    });
  }

  private dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('arrival_at')?.value;
    const end = group.get('departure_at')?.value;
    return start && end && new Date(start) >= new Date(end) ? { dateRangeInvalid: true } : null;
  }

private loadReservation(id: number) {
  this.isLoading.set(true);
  this.service.get(id).subscribe({
    next: (res: any) => { 
      this.form.patchValue({
        reservation_name: res.reservation_name,
        phone_number: res.phone_number,
        nb_of_people: res.nb_of_people,
        unit_id: res.unit_id,
        arrival_at: new Date(res.arrival_at + 'T00:00:00'),
        departure_at: new Date(res.departure_at + 'T00:00:00')
      }, { emitEvent: false });

      console.log('Full Response Object:', res);

      const accId = res.unit?.accommodation_id || 
                    res.unit?.accommodation?.id || 
                    res.accommodation_id;

      console.log('Final AccID Check:', accId);

      if (accId) {
        this.loadUnits(accId);
      }

      if (res.unit_id) {
        this.loadReservedDates(res.unit_id);
      }

      this.isLoading.set(false);
    },
    error: (err) => this.handleError(err)
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
    
    if (err.error?.message) {
      const messages = Array.isArray(err.error.message) 
        ? err.error.message 
        : [err.error.message];
      this.serverErrors.set(messages);
    } else {
      this.serverErrors.set([err.message || 'An unexpected error occurred']);
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
