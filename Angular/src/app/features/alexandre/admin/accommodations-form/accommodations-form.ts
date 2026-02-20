import { Component, signal, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Accommodation, AccommodationCategory } from '@core/models/accommodation';

@Component({
  selector: 'app-accommodation-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatSlideToggleModule, 
    MatButtonModule, RouterLink
  ],
  templateUrl: './accommodations-form.html',
  styleUrl: './accommodations-form.css'
})
export class AccommodationsForm implements OnInit {
  private fb = inject(FormBuilder);
  
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    category: [AccommodationCategory.Hotel, [Validators.required]],
    address: ['', [Validators.required]],
    latitude: [0],
    longitude: [0],
    shuttle: [false],
    time_car: ['00:00'],
    time_walk: ['00:00'],
    commission: [0, [Validators.min(0)]],
    festival_id: [null, [Validators.required]]
  });

  isEditMode = signal(false);
  isLoading = signal(false);
  serverErrors = signal<string[]>([]);
  festivals = signal([{ id: 1, name: 'Hellfest' }]);

  ngOnInit(): void {
    // Check for ID in route to enable isEditMode and patchValue
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      const payload = this.form.value;
      console.log('Sending to API:', payload);
    }
  }
}
