import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter, MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Package } from '../../../../../core/models/package';
import { FestivalService } from '../../../../../core/services/festival.service';

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

    if (start >= end) {
      return { dateRangeInvalid: true };
    }
  }
  return null;
};

@Component({
  selector: 'app-package-form',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, 
    MatButtonModule, MatIconModule, MatProgressBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ isEditMode() ? 'Modifier' : 'Ajouter' }} un Billet
    </h2>
    
    <div class="dialog-layout">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-section">
        <mat-dialog-content class="content-scrollable">
          
          @if (serverErrors().length > 0) {
            <div class="form-error">
              @for (error of serverErrors(); track $index) {
                <div>{{ error }}</div>
              }
            </div>
          }

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Titre</mat-label>
            <input matInput formControlName="title" placeholder="Ex: Billet Journalier">
            @if (form.get('title')?.hasError('required')) {
              <mat-error>Requis</mat-error>
            }
            @if (form.get('title')?.hasError('maxlength')) {
              <mat-error>Maximum 50 caractères</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
            @if (form.get('description')?.hasError('maxlength')) {
              <mat-error>Maximum 100 caractères</mat-error>
            }
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Prix ($)</mat-label>
              <input matInput type="number" formControlName="price">
              @if (form.get('price')?.hasError('required')) {
                <mat-error>Requis</mat-error>
              }
              @if (form.get('price')?.hasError('min')) {
                <mat-error>Le prix ne peut pas être négatif</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Quota</mat-label>
              <input matInput type="number" formControlName="quota">
              
              @if (form.get('quota')?.hasError('required')) {
                <mat-error>Requis</mat-error>
              }
              @if (form.get('quota')?.hasError('min')) {
                <mat-error>Quota doit être supérieur à 0</mat-error>
              }
              @if (form.get('quota')?.hasError('max')) {
                <mat-error>Capacité maximale de {{ festivalCapacity() }} places</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="row date-row">
            <mat-form-field appearance="outline">
              <mat-label>Date début</mat-label>
              <input matInput [matDatepicker]="pickerStart" formControlName="valid_date">
              <mat-datepicker-toggle matIconSuffix [for]="pickerStart"></mat-datepicker-toggle>
              <mat-datepicker #pickerStart></mat-datepicker>
              @if (form.get('valid_date')?.hasError('required')) {
                <mat-error>Requis</mat-error>
              }
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="time-input">
              <mat-label>Heure</mat-label>
              <input matInput type="time" formControlName="valid_time">
              @if (form.get('valid_time')?.hasError('required')) {
                <mat-error>Requis</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="row date-row">
            <mat-form-field appearance="outline">
              <mat-label>Date fin</mat-label>
              <input matInput [matDatepicker]="pickerEnd" formControlName="expired_date">
              <mat-datepicker-toggle matIconSuffix [for]="pickerEnd"></mat-datepicker-toggle>
              <mat-datepicker #pickerEnd></mat-datepicker>
              @if (form.get('expired_date')?.hasError('required')) {
                <mat-error>Requis</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="time-input">
              <mat-label>Heure</mat-label>
              <input matInput type="time" formControlName="expired_time">
              @if (form.get('expired_time')?.hasError('required')) {
                <mat-error>Requis</mat-error>
              }
            </mat-form-field>
          </div>

          @if (form.hasError('dateRangeInvalid') && (form.get('expired_date')?.touched || form.get('expired_time')?.touched)) {
            <div class="time-error">
              La date et l'heure de fin doivent être strictement après le début.
            </div>
          }

          @if (form.hasError('validBeforeFestival') && (form.get('valid_date')?.touched || form.get('valid_time')?.touched)) {
            <div class="time-error">
              La date de début ne peut pas être avant l'ouverture du festival ({{ festivalStartLimit() | date:'shortDate' }}).
            </div>
          }

          @if (form.hasError('expiredAfterFestival') && (form.get('expired_date')?.touched || form.get('expired_time')?.touched)) {
            <div class="time-error">
              La date de fin ne peut pas dépasser la fermeture du festival ({{ festivalEndLimit() | date:'shortDate' }}).
            </div>
          }

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Type</mat-label>
            <mat-select formControlName="category">
              <mat-option value="general">Général</mat-option>
              <mat-option value="daily">Journalier</mat-option>
              <mat-option value="evening">Soirée</mat-option>
            </mat-select>
            @if (form.get('category')?.hasError('required')) {
              <mat-error>Requis</mat-error>
            }
          </mat-form-field>

          <div class="file-input-container">
            <button type="button" mat-stroked-button (click)="fileInput.click()">
              <mat-icon>image</mat-icon> Image de fond
            </button>
            <input #fileInput type="file" (change)="onFileSelected($event)" style="display:none" accept="image/jpeg,image/png,image/webp">
            <span *ngIf="selectedFile" class="file-name">{{ selectedFile.name }}</span>
          </div>

        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="dialogRef.close()" [disabled]="isLoading()">Annuler</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || isLoading()">
            @if (isLoading()) {
              <span>Traitement...</span>
            } @else {
              {{ isEditMode() ? 'Sauvegarder' : 'Ajouter' }}
            }
          </button>
        </mat-dialog-actions>
      </form>

      <div class="preview-section">
        <h3>Aperçu</h3>
        <div class="ticket-card-preview">
          <div class="card-content-layout">
            
            <div class="ticket-visual">
              <img [src]="previewUrl || data?.image_url || 'https://placehold.co/150x150/orange/white.png?text=Billet'" alt="ticket">
              <span class="category-badge" [class]="form.get('category')?.value">
                {{ form.get('category')?.value || 'TYPE' }}
              </span>
            </div>

            <div class="ticket-info">
              <div class="info-header">
                <h3>{{ form.get('title')?.value || 'Titre du billet' }}</h3>
                <span class="price">{{ (form.get('price')?.value || 0) | currency:'CAD':'symbol-narrow' }}</span>
              </div>
              
              <div class="date-info">
                <strong>Valide:</strong> {{ form.get('valid_date')?.value | date:'shortDate' }}
                {{ form.get('valid_time')?.value }}
              </div>
              
              <p class="description">{{ form.get('description')?.value || 'Description du billet...' }}</p>

              <div class="quota-section">
                <div class="quota-labels">
                  <span>Ventes</span>
                  <span>0 / {{ form.get('quota')?.value }}</span>
                </div>
                <mat-progress-bar mode="determinate" value="0"></mat-progress-bar>
              </div>
            </div>
          </div>
        </div>
        <p class="preview-note">* Ceci est un aperçu visuel</p>
      </div>
    </div>
  `,
  styles: [`
    h2 { margin: 0; padding: 20px 24px 0; }
    .dialog-layout { display: flex; gap: 20px; padding: 10px; min-width: 1000px; height: 650px;}
    
    .form-section { flex: 1; display: flex; flex-direction: column; }
    .content-scrollable { overflow-y: auto; padding-top: 10px; }
    
    .full-width { width: 100%; }
    .row { display: flex; gap: 15px; }
    .row mat-form-field { flex: 1; }
    .time-input { flex: 0.5 !important; }

    .file-input-container { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
    .file-name { font-size: 0.8rem; color: #666; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .form-error { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 15px; font-size: 0.9rem; }
    .time-error { color: #f44336; font-size: 75%; padding-left: 16px; margin-top: -10px; margin-bottom: 15px; }

    .preview-section { flex: 1; background: #f5f5f5; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .preview-note { margin-top: 10px; font-size: 0.8rem; color: #888; font-style: italic; }

    .ticket-card-preview {
      width: 100%;
      background: var(--mat-sys-surface-container-low, white);
      border: 2px solid black;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 8px 8px 0px var(--mat-sys-tertiary, #ccc);
    }
    .card-content-layout { display: flex; height: 140px; }
    
    .ticket-visual { width: 140px; position: relative; border-right: 2px solid black; }
    .ticket-visual img { width: 100%; height: 100%; object-fit: cover; }
    
    .category-badge {
      position: absolute; top: 10px; left: 10px; padding: 4px 8px;
      font-size: 0.7rem; font-weight: bold; border-radius: 4px;
      border: 1px solid black; text-transform: uppercase; background: #eee;
    }
    .category-badge.general { background: #E0E0E0; }
    .category-badge.daily { background: #FFD700; }
    .category-badge.evening { background: #ADD8E6; }

    .ticket-info { flex: 1; padding: 15px; display: flex; flex-direction: column; justify-content: space-between; }
    .info-header { display: flex; justify-content: space-between; align-items: center; }
    .info-header h3 { margin: 0; font-size: 1.1rem; font-weight: 700; }
    .price { font-size: 1.1rem; font-weight: 900; color: var(--mat-sys-primary); }
    .description { font-size: 0.8rem; color: #666; margin: 5px 0 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .date-info { font-size: 0.8rem; margin-top: 2px; }
    .quota-labels { display: flex; justify-content: space-between; font-size: 0.7rem; }
  `]
})
export class PackageFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<PackageFormComponent>);

  private festivalService = inject(FestivalService);
  
  form!: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  
  isEditMode = signal(false);
  isLoading = signal(false);
  serverErrors = signal<string[]>([]);

  festivalCapacity = signal<number | null>(null);
  festivalStartLimit = signal<Date | null>(null);
  festivalEndLimit = signal<Date | null>(null);

  constructor(@Inject(MAT_DIALOG_DATA) public data: Package) {
    if (this.data) {
      this.isEditMode.set(true);
    }
  }

  ngOnInit() {
    const startDate = this.data?.valid_at ? new Date(this.data.valid_at) : new Date();
    const endDate = this.data?.expired_at ? new Date(this.data.expired_at) : new Date();

    this.form = this.fb.group({
      title: [this.data?.title || '', [Validators.required, Validators.maxLength(50)]],
      description: [this.data?.description || '', [Validators.maxLength(100)]],
      price: [this.data?.price || 0, [Validators.required, Validators.min(0)]],
      quota: [this.data?.quota || 100, [Validators.required, Validators.min(1)]],
      category: [this.data?.category || 'general', Validators.required],
      
      valid_date: [startDate, Validators.required],
      valid_time: [this.formatTime(startDate), Validators.required],
      
      expired_date: [endDate, Validators.required],
      expired_time: [this.formatTime(endDate), Validators.required],

      festival_id: [this.data?.festival_id || 1] 
    }, { 
      validators: [dateRangeValidator, this.festivalBoundsValidator()] 
    });

    const currentFestId = this.data?.festival_id || 1;

    this.festivalService.getFestivals().subscribe({
      next: (festivals) => {
        const festival = festivals.find(f => f.id === currentFestId);
        
        if (festival) {
          // Validation du Quota
          if (festival.daily_capacity) {
            this.festivalCapacity.set(festival.daily_capacity);
            const quotaControl = this.form.get('quota');
            quotaControl?.setValidators([
              Validators.required,
              Validators.min(1),
              Validators.max(festival.daily_capacity)
            ]);
            quotaControl?.updateValueAndValidity();
          }

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

          this.form.updateValueAndValidity();
        }
      }
    });
  }

  private festivalBoundsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fStart = this.festivalStartLimit();
      const fEnd = this.festivalEndLimit();
      
      if (!fStart || !fEnd) return null; // Les données du festival ne sont pas encore chargées

      const vDate = control.get('valid_date')?.value;
      const vTime = control.get('valid_time')?.value;
      const eDate = control.get('expired_date')?.value;
      const eTime = control.get('expired_time')?.value;

      if (!vDate || !vTime || !eDate || !eTime) return null;

      // Construction de la date de DÉBUT
      const start = new Date(vDate);
      const [sHours, sMinutes] = vTime.split(':').map(Number);
      start.setHours(sHours, sMinutes, 0);

      // Construction de la date de FIN
      const end = new Date(eDate);
      const [eHours, eMinutes] = eTime.split(':').map(Number);
      end.setHours(eHours, eMinutes, 0);

      const errors: any = {};
      let hasError = false;

      // Comparaisons identiques à Rails
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

  private formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5);
  }

  private combineDateTime(dateVal: Date, timeVal: string): Date {
    const d = new Date(dateVal);
    const [hours, minutes] = timeVal.split(':').map(Number);
    d.setHours(hours, minutes, 0);
    return d;
  }

  private parseDateWithoutTimezone(dateString: any): Date {
    if (!dateString) return new Date();
    // S'assure de prendre seulement la partie date (YYYY-MM-DD)
    const parts = dateString.toString().split('T')[0].split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS compte les mois de 0 à 11
    const day = parseInt(parts[2], 10);
    
    return new Date(year, month, day);
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    this.serverErrors.set([]);

    if (this.form.valid) {
      this.isLoading.set(true);
      const val = this.form.value;

      const validAtFull = this.combineDateTime(val.valid_date, val.valid_time);
      const expiredAtFull = this.combineDateTime(val.expired_date, val.expired_time);

      const finalData = {
        title: val.title,
        description: val.description,
        price: val.price,
        quota: val.quota,
        category: val.category,
        festival_id: val.festival_id,
        valid_at: validAtFull.toISOString(),
        expired_at: expiredAtFull.toISOString()
      };

      this.dialogRef.close({ ...finalData, file: this.selectedFile });
    }
  }
}