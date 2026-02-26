import { Component, signal, OnInit, inject } from '@angular/core';
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
export class UnitsForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(UnitsService);
  private accService = inject(AccommodationsService);

  form: FormGroup = this.fb.group({
    type: ['', Validators.required],
    cost_person_per_night: [0, [Validators.required, Validators.min(0), Validators.max(9999)]],
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(255)]], // MySQL TinyInt limit
    wifi: [false],
    water: ['no_water', Validators.required],
    electricity: [false],
    parking_cost: [0, [Validators.required, Validators.min(0), Validators.max(99)]],
    food_options: [[], Validators.required]
  });

  unitId = signal<number | null>(null);
  accommodationId = signal<number | null>(null);
  parentCategory = signal<number | string | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);
  isTerrain = signal(false);
  selectedFile = signal<File | null>(null);
  serverErrors = signal<string[]>([]);

  readonly ROOM_TYPES = ['SimpleRoom', 'DoubleRoom', 'FamilyRoom'];
  readonly TERRAIN_TYPES = ['SmallTerrain', 'StandardTerrain', 'DeluxeTerrain'];
  readonly FOOD_OPTIONS = ['None', 'Canteen', 'Room service', 'Restaurant'];

  constructor() {
    this.form.get('type')?.valueChanges.subscribe(value => {
      this.isTerrain.set(this.TERRAIN_TYPES.includes(value));
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const isEdit = this.route.snapshot.queryParamMap.get('edit') === 'true';

    if (id !== null) {
      const numericId = Number(id);

      if (isEdit) {
        this.isEditMode.set(true);
        this.unitId.set(numericId);
        this.loadUnit(numericId);
      } else {
        this.accommodationId.set(numericId);
        this.fetchParentCategory(numericId);
      }
    }
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
    });
  }

  private loadUnit(id: number) {
    this.isLoading.set(true);
    this.service.getUnit(id).subscribe({
      next: (unit) => {
        if (!unit) {
          this.serverErrors.set(['Unit data not found']);
          this.isLoading.set(false);
          return;
        }

        const rawType = unit.type || '';
        const cleanType = rawType.split('::').pop() || rawType;
        
        this.form.patchValue({
          ...unit,
          type: cleanType
        });

        this.accommodationId.set(unit.accommodation_id);
        
        this.fetchParentCategory(unit.accommodation_id);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.serverErrors.set([err.message || 'Failed to load unit']);
        this.isLoading.set(false);
      }
    });
  }

  private preparePayload() {
    const rawValue = this.form.value;
    let food = rawValue.food_options || [];

    if (food.length > 1 && food.includes('None')) {
      food = food.filter((f: string) => f !== 'None');
    }

    if (food.length === 0) food = ['None'];

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
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/units', this.accommodationId()]);
        },
        error: (err) => {
          this.serverErrors.set([err.message]);
          this.isLoading.set(false);
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
          this.serverErrors.set([err.message]);
          this.isLoading.set(false);
        }
      });
    }
  }
}
