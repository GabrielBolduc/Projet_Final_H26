import { Component, OnInit, inject, signal, computed, effect, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, map, filter, startWith } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule, MatDateRangePicker } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { AccommodationsService } from '@core/services/accommodations.service';
import { UnitsService } from '@core/services/units.service';
import { ReservationsService } from '@core/services/reservation.service';

@Component({
  selector: 'app-reservations-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule,
    MatDatepickerModule, MatNativeDateModule, MatDialogModule, RouterLink, TranslateModule, CurrencyPipe
  ],
  templateUrl: './reservations-form.html',
  styleUrl: './reservations-form.css'
})
export class ReservationsForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private accService = inject(AccommodationsService);
  private unitsService = inject(UnitsService);
  private resService = inject(ReservationsService);

  @ViewChild('picker') picker!: MatDateRangePicker<Date>;

  isLoading = signal(false);
  serverErrors = signal<string[]>([]);
  takenDates = signal<number[]>([]); 
  
  private accId$ = this.route.queryParamMap.pipe(
    map(params => Number(params.get('accommodationId'))),
    filter(id => !!id)
  );
  
  accommodation = toSignal(this.accId$.pipe(
    switchMap(id => this.accService.getAccommodation(id)),
    map(res => (res as any)?.data || res)
  ), { initialValue: null });

  units = toSignal(this.accId$.pipe(
    switchMap(id => this.unitsService.getUnitsByAccommodation(id)),
    map(res => (res as any).data || [])
  ), { initialValue: [] as any[] });

  form: FormGroup = this.fb.group({
    reservation_name: ['', [Validators.required, Validators.maxLength(100)]],
    phone_number: ['', [Validators.required, Validators.pattern(/^[\d\s\-+()]{7,20}$/)]],
    unit_id: ['', [Validators.required]],
    nb_of_people: [1, [Validators.required, Validators.min(1)]],
    arrival_at: ['', [Validators.required]],
    departure_at: ['', [Validators.required]],
  });

  private formValue = toSignal(this.form.valueChanges.pipe(startWith(this.form.value)));

  // --- REPLACED: Simple logic to refresh taken dates ---
  private unitChanges = effect(() => {
    const unitId = this.formValue()?.unit_id;
    if (unitId) {
      this.resService.list({ unit_id: unitId }).subscribe(res => {
        const timestamps = res.data.flatMap(r => {
          const dates = [];
          let curr = new Date(r.arrival_at);
          const end = new Date(r.departure_at);
          while (curr <= end) {
            dates.push(new Date(curr).setHours(0,0,0,0));
            curr.setDate(curr.getDate() + 1);
          }
          return dates;
        });
        this.takenDates.set(timestamps);
        if (this.picker) this.picker.stateChanges.next();
      });
    }
  });

  // --- Constraints for the picker ---
  minFestDate = computed(() => {
    const acc = this.accommodation();
    if (!acc?.start_at) return null;
    const d = new Date(acc.start_at);
    d.setDate(d.getDate() - 3);
    return d;
  });

  startAtDate = computed(() => {
    const acc = this.accommodation();
    // Default to the actual festival start date if available
    return acc?.start_at ? new Date(acc.start_at) : new Date();
  });

  maxFestDate = computed(() => {
    const acc = this.accommodation();
    if (!acc?.end_at) return null;
    const d = new Date(acc.end_at);
    d.setDate(d.getDate() + 3);
    return d;
  });

  dateFilter = (d: Date | null): boolean => {
    if (!d) return false;
    const time = new Date(d).setHours(0,0,0,0);
    return !this.takenDates().includes(time);
  };

  selectedUnit = computed(() => {
    const id = Number(this.formValue()?.unit_id);
    return this.units().find((u: any) => Number(u.id) === id) || null;
  });

  totalPrice = computed(() => {
    const val = this.formValue();
    const unit = this.selectedUnit();
    if (unit && val.arrival_at && val.departure_at) {
      const start = new Date(val.arrival_at);
      const end = new Date(val.departure_at);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return (nights > 0 && (val.nb_of_people || 0) > 0) 
        ? (Number(unit.cost_person_per_night) * val.nb_of_people * nights) : 0;
    }
    return 0;
  });

  ngOnInit(): void {
    if (!this.route.snapshot.queryParamMap.get('accommodationId')) {
      this.router.navigate(['/accommodations']);
    }
  }

  onSubmit() {
    if (this.form.valid && this.accommodation()) {
      this.isLoading.set(true);
      this.serverErrors.set([]);

      const rawValue = this.form.getRawValue();
      const payload = {
        ...rawValue,
        phone_number: rawValue.phone_number.replace(/[^\d+]/g, ''),
        festival_id: this.accommodation()!.id 
      };

      this.resService.create(payload).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/accommodations']);
        },
        error: (err: Error) => {
          this.serverErrors.set([err.message]);
          this.isLoading.set(false);
        }
      });
    } else {
      this.form.markAllAsTouched();
    }
  }
}
