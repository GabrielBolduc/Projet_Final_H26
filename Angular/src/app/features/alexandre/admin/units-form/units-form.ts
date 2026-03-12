import { Component, signal, inject, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UnitsService } from '@core/services/units.service';
import { AccommodationsService } from '@core/services/accommodations.service';
import { TranslateModule } from '@ngx-translate/core';
import { UnitType } from '@core/models/unit';

@Component({
  selector: 'app-units-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatSlideToggleModule, 
    MatButtonModule, MatIconModule, TranslateModule, RouterLink
  ],
  templateUrl: './units-form.html',
  styleUrl: './units-form.css'
})
export class UnitsForm {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(UnitsService);
  private accService = inject(AccommodationsService);

  form: FormGroup = this.fb.group({
    type: ['', Validators.required],
    cost_person_per_night: [0, [Validators.required, Validators.min(0), Validators.max(9999)]],
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(255)]], 
    wifi: [false],
    water: ['no_water', Validators.required],
    electricity: [false],
    parking_cost: [0, [Validators.required, Validators.min(0), Validators.max(99)]],
    food_options: [['None'], Validators.required]
  });

  unitId = signal<number | null>(null);
  accommodationId = signal<number | null>(null);
  parentCategory = signal<number | string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);
  isTerrain = signal(false);
  selectedFile = signal<File | null>(null);
  serverErrors = signal<string[]>([]);
  private params = toSignal(this.route.paramMap);
  private queryParams = toSignal(this.route.queryParamMap);

  readonly ROOM_TYPES = ['SimpleRoom', 'DoubleRoom', 'FamilyRoom'];
  readonly TERRAIN_TYPES = ['SmallTerrain', 'StandardTerrain', 'DeluxeTerrain'];
  readonly FOOD_OPTIONS = ['None', 'Canteen', 'Room service', 'Restaurant'];

  constructor() {
    effect(() => {
      const id = this.params()?.get('id');
      const isEdit = this.queryParams()?.get('edit') === 'true';

      if (id) {
        const numericId = Number(id);
        if (isEdit) {
          this.isEditMode.set(true);
          this.unitId.set(numericId);
          this.loadUnit(numericId);
        } else {
          this.isEditMode.set(false);
          this.accommodationId.set(numericId);
          this.fetchParentCategory(numericId);
          this.form.reset({ quantity: 1, water: 'no_water', food_options: ['None'] });
        }
      }
    });

    this.setupFormSubscriptions();
  }

  private setupFormSubscriptions() {
    this.form.get('type')?.valueChanges.subscribe(value => {
      this.isTerrain.set(this.TERRAIN_TYPES.includes(value));
    });

    this.form.get('food_options')?.valueChanges.subscribe((values: string[]) => {
      if (!values || values.length === 0) return;

      const hasNone = values.includes('None');
      const lastSelected = values[values.length - 1];

      if (lastSelected === 'None' && values.length > 1) {
        this.form.get('food_options')?.setValue(['None'], { emitEvent: false });
      } 
      else if (hasNone && values.length > 1) {
        const filtered = values.filter(v => v !== 'None');
        this.form.get('food_options')?.setValue(filtered, { emitEvent: false });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  private fetchParentCategory(accId: number) {
    this.accService.getAccommodation(accId).subscribe(acc => {
      this.parentCategory.set(acc.category);

      const isCamping = String(acc.category) === 'camping';
      
      if (isCamping) {
        this.isTerrain.set(true);
        if (!this.isEditMode()) {
          this.form.patchValue({ type: 'SmallTerrain' }, { emitEvent: true });
        }
      }
    });
  }

private loadUnit(id: number) {
  this.isLoading.set(true);
  this.service.getUnit(id).subscribe({
    next: (unit) => {
      if (!unit) return;

      const rawType = unit.type || '';
      const cleanType = rawType.split('::').pop() as UnitType;

      this.isTerrain.set(this.TERRAIN_TYPES.includes(cleanType));

      this.form.patchValue({
        ...unit,
        type: cleanType
      });

      this.accommodationId.set(unit.accommodation_id);
      this.fetchParentCategory(unit.accommodation_id);
      this.isLoading.set(false);
    },
    error: (err) => {
      this.serverErrors.set([err.message]);
      this.isLoading.set(false);
    }
  });
}

  private preparePayload() {
    const rawValue = this.form.value;
    const food = rawValue.food_options.length > 0 ? rawValue.food_options : ['None'];

    return {
      ...rawValue,
      type: `Units::${rawValue.type}`,
      food_options: food
    };
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      this.serverErrors.set([]);
      
      const payload = this.preparePayload();
      const file = this.selectedFile();

      if (!this.isEditMode() && !file) {
        this.serverErrors.set(['Image is required for new units']);
        this.isLoading.set(false);
        return;
      }

      const request = this.isEditMode()
        ? this.service.updateUnit(this.unitId()!, payload, file || undefined)
        : this.service.createUnit(this.accommodationId()!, payload, file!);

      request.subscribe({
        next: (unit) => {
          this.isLoading.set(false);
          this.router.navigate(['/units', this.accommodationId()]);
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }
  }

  onDelete(): void {
    if (confirm('Are you sure you want to delete this unit?')) {
      this.isLoading.set(true);
      this.service.deleteUnit(this.unitId()!).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/units', this.accommodationId()]);
        },
        error: (err) => {
          this.handleError(err);
        }
      });
    }
  }

  private handleError(err: any) {
    this.isLoading.set(false);
    
    const errorBody = err.error || err;

    if (errorBody.errors) {
      const messages = Object.entries(errorBody.errors).map(
        ([field, msgs]) => `${field.replace('_', ' ')}: ${(msgs as string[]).join(', ')}`
      );
      this.serverErrors.set(messages);
    } else if (errorBody.message) {
      this.serverErrors.set([errorBody.message]);
    } else {
      this.serverErrors.set(['An unexpected error occurred.']);
    }
  }
}
