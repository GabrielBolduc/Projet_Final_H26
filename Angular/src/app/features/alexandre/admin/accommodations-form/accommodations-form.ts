import { Component, signal, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AccommodationsService } from '@core/services/accommodations.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-accommodation-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatSlideToggleModule, 
    MatButtonModule, RouterLink, MatIconModule, TranslateModule
  ],
  templateUrl: './accommodations-form.html',
  styleUrl: './accommodations-form.css'
})
export class AccommodationsForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute); 
  private router = inject(Router);        
  private service = inject(AccommodationsService);
  private translate = inject(TranslateService);
  coordRegex = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
  
  form: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    category: [1, [Validators.required]],
    address: ['', [Validators.required, Validators.maxLength(255)]],
    coordinates: ['', [Validators.pattern(this.coordRegex)]], 
    latitude: [0],
    longitude: [0],
    shuttle: [false],
    time_car: ['00:00'],
    time_walk: ['00:00'],
    commission: [0, [
      Validators.required, 
      Validators.min(0), 
      Validators.max(29.99)
    ]],
  });

  accommodationId = signal<number | null>(null);
  isEditMode = signal(false);
  isLoading = signal(false);
  serverErrors = signal<string[]>([]);
  festivals = signal([{ id: 1, name: 'Hellfest' }]);
  
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.isEditMode.set(true);
      this.accommodationId.set(+id);
      this.loadAccommodation(+id);
    } else {
      const catParam = this.route.snapshot.queryParamMap.get('category');
      if (catParam === 'camping') {
        this.form.patchValue({ category: 0 });
      } else if (catParam === 'hotel') {
        this.form.patchValue({ category: 1 });
      }
    }

    this.form.get('coordinates')?.valueChanges.subscribe(value => {
      if (value && this.coordRegex.test(value)) {
        const [lat, lng] = value.split(',').map((s: string) => parseFloat(s.trim()));
        this.form.patchValue({ 
          latitude: lat, 
          longitude: lng 
        }, { emitEvent: false });
      }
    });
  }

  private loadAccommodation(id: number) {
    this.isLoading.set(true);
    this.service.getAccommodation(id).subscribe({
      next: (data: any) => {
        let numericCategory = 0; 
        if (data.category === 'hotel' || data.category === 1) numericCategory = 1;
        if (data.category === 'camping' || data.category === 0) numericCategory = 0;

        const extractTime = (timeStr: string) => {
          if (!timeStr) return '00:00';
          const match = timeStr.match(/(\d{2}:\d{2})/);
          return match ? match[1] : '00:00';
        };

        const formattedData = {
          ...data,
          coordinates: `${data.latitude}, ${data.longitude}`,
          category: numericCategory,
          time_car: extractTime(data.time_car),
          time_walk: extractTime(data.time_walk)
        };

        this.form.patchValue(formattedData);

        if (this.isEditMode()) {
          this.form.get('category')?.disable();
        }
        
        this.form.markAsPristine();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.serverErrors.set([err.message]);
        this.isLoading.set(false);
      }
    });
  }

  getCategoryString(val: number): string {
    const mapping: { [key: number]: string } = {
      0: 'camping',
      1: 'hotel'
    };
    return mapping[val] || 'hotel'; 
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading.set(true);
      
      const payload = this.form.getRawValue();
      const categoryLabel = this.getCategoryString(payload.category);
      const id = this.accommodationId();
      
      const request = this.isEditMode() 
        ? this.service.updateAccommodation(id!, payload) 
        : this.service.createAccommodation(payload);

      request.subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/accommodations'], { 
            queryParams: { category: categoryLabel } 
          });
        },
        error: (err) => {
          this.serverErrors.set([err.message]);
          this.isLoading.set(false);
        }
      });
    }
  }

  onDelete() {
    const id = this.accommodationId();
    if (!id) return;
    
    const categoryValue = this.form.getRawValue().category;
    const categoryLabel = this.getCategoryString(categoryValue);
    const confirmMsg = this.translate.instant('ACCOMMODATIONS.FORM.DELETE_CONFIRM');

    if (confirm(confirmMsg)) {
      this.isLoading.set(true);
      this.service.deleteAccommodation(id).subscribe({
        next: () => {
          this.isLoading.set(false);
          this.router.navigate(['/accommodations'], { 
            queryParams: { category: categoryLabel } 
          });
        },
        error: (err) => {
          this.serverErrors.set([err.message]);
          this.isLoading.set(false);
        }
      });
    }
  }
}
