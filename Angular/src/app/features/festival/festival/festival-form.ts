import { Component, OnInit, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; // <-- Ajout de TranslateService
import { firstValueFrom } from 'rxjs';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'; 
import { FestivalService } from '../../../core/services/festival.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-festival-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    TranslateModule,
    MatSnackBarModule
  ],
  templateUrl: './festival-form.html',
  styleUrls: ['./festival-form.css']
})
export class FestivalFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private festivalService = inject(FestivalService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private errorHandler = inject(ErrorHandlerService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService); // <-- Injection du service de traduction

  minDate = new Date();

  festivalForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    status: ['draft', [Validators.required]],
    start_at: ['', [Validators.required]],
    end_at: ['', [Validators.required]],
    address: ['', [Validators.required]],
    daily_capacity: [0, [Validators.required, Validators.min(1)]],
    latitude: [null, [Validators.required]], 
    longitude: [null, [Validators.required]] 
  });

  isEditMode = signal(false);
  isLoading = signal(false);
  serverErrors = signal<string[]>([]);
  festivalId: number | null = null;

  // Transformé en Getter pour que la traduction se fasse de façon dynamique
  get statusOptions() {
    return [
      { value: 'draft', label: this.translate.instant('FESTIVAL.DRAFT') },
      { value: 'ongoing', label: this.translate.instant('FESTIVAL.ONGOING') }
    ];
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.festivalId = Number(id);
      this.loadFestival();
    }
  }

  async loadFestival() {
    if (!this.festivalId) return;
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.festivalService.getFestival(this.festivalId));
      this.festivalForm.patchValue(data);
    } catch (err) {
      this.snackBar.open(
        this.translate.instant('FESTIVAL.LOAD_ERROR'), 
        this.translate.instant('COMMON.CLOSE'), 
        { duration: 4000 }
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit() {
    if (this.festivalForm.invalid) return;

    this.isLoading.set(true);
    this.serverErrors.set([]);

    try {
      if (this.isEditMode() && this.festivalId) {
        await firstValueFrom(this.festivalService.updateFestival(this.festivalId, this.festivalForm.value));
        this.snackBar.open(
          this.translate.instant('FESTIVAL.UPDATE_SUCCESS'), 
          this.translate.instant('COMMON.CLOSE'), 
          { duration: 3000 }
        );
      } else {
        await firstValueFrom(this.festivalService.createFestival(this.festivalForm.value));
        this.snackBar.open(
          this.translate.instant('FESTIVAL.CREATE_SUCCESS'), 
          this.translate.instant('COMMON.CLOSE'), 
          { duration: 3000 }
        );
      }
      this.router.navigate(['/admin/festivals']);
    } catch (err) {
      const errors = this.errorHandler.parseRailsErrors(err);
      this.serverErrors.set(errors);
      
      const errorMessage = errors.length > 0 ? errors[0] : this.translate.instant('FESTIVAL.SAVE_ERROR');
      
      this.snackBar.open(
        errorMessage, 
        this.translate.instant('COMMON.UNDERSTOOD'), 
        { duration: 6000 }
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}