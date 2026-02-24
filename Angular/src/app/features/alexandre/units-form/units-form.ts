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

  form: FormGroup = this.fb.group({
    type: ['', Validators.required],
    cost_person_per_night: [0, [Validators.required, Validators.min(0)]],
    quantity: [1, [Validators.required, Validators.min(1)]],
    wifi: [false],
    water: [0],
    electricity: [false],
    parking_cost: [0, [Validators.required, Validators.min(0)]],
    food_options: [[]]
  });

  unitId = signal<number | null>(null);
  accommodationId = signal<number | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);
  isTerrain = signal(false);
  selectedFile = signal<File | null>(null);
  serverErrors = signal<string[]>([]);

  readonly ROOM_TYPES = ['SimpleRoom', 'DoubleRoom', 'FamilyRoom'];
  readonly TERRAIN_TYPES = ['SmallTerrain', 'StandardTerrain', 'DeluxeTerrain'];
  readonly FOOD_OPTIONS = ['None', 'Canteen', 'Room service', 'Restaurant'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const isEdit = this.route.snapshot.queryParamMap.get('edit') === 'true';

    if (id && isEdit) {
      this.isEditMode.set(true);
      this.unitId.set(+id);
      this.loadUnit(+id);
    } else if (id) {
      this.accommodationId.set(+id);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
    }
  }

  private loadUnit(id: number) {
    this.isLoading.set(true);
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      const payload = this.form.value;
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
          this.router.navigate(['/accommodations', this.accommodationId()]);
        },
        error: (err) => {
          this.serverErrors.set([err.message]);
          this.isLoading.set(false);
        }
      });
    }
  }
}
