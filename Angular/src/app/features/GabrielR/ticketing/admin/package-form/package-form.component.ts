import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar'; // preview vente
import { Package } from '../../../../../core/models/package';

@Component({
  selector: 'app-package-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, 
    MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, 
    MatButtonModule, MatIconModule, MatProgressBarModule
  ],
  template: `
    <h2 mat-dialog-title>
      {{ isEditMode ? 'Modifier' : 'Ajouter' }} un Billet
    </h2>
    
    <div class="dialog-layout">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-section">
        <mat-dialog-content class="content-scrollable">
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Titre</mat-label>
            <input matInput formControlName="title" placeholder="Ex: Billet Journalier">
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3"></textarea>
          </mat-form-field>

          <div class="row">
            <mat-form-field appearance="outline">
              <mat-label>Prix ($)</mat-label>
              <input matInput type="number" formControlName="price">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Quota</mat-label>
              <input matInput type="number" formControlName="quota">
            </mat-form-field>
          </div>

          <div class="row date-row">
            <mat-form-field appearance="outline">
              <mat-label>Date début</mat-label>
              <input matInput [matDatepicker]="pickerStart" formControlName="valid_date">
              <mat-datepicker-toggle matIconSuffix [for]="pickerStart"></mat-datepicker-toggle>
              <mat-datepicker #pickerStart></mat-datepicker>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="time-input">
              <mat-label>Heure</mat-label>
              <input matInput type="time" formControlName="valid_time">
            </mat-form-field>
          </div>

          <div class="row date-row">
            <mat-form-field appearance="outline">
              <mat-label>Date fin</mat-label>
              <input matInput [matDatepicker]="pickerEnd" formControlName="expired_date">
              <mat-datepicker-toggle matIconSuffix [for]="pickerEnd"></mat-datepicker-toggle>
              <mat-datepicker #pickerEnd></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline" class="time-input">
              <mat-label>Heure</mat-label>
              <input matInput type="time" formControlName="expired_time">
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Type</mat-label>
            <mat-select formControlName="category">
              <mat-option value="general">Général</mat-option>
              <mat-option value="daily">Journalier</mat-option>
              <mat-option value="evening">Soirée</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="file-input-container">
            <button type="button" mat-stroked-button (click)="fileInput.click()">
              <mat-icon>image</mat-icon> Image de fond
            </button>
            <input #fileInput type="file" (change)="onFileSelected($event)" style="display:none" accept="image/*">
            <span *ngIf="selectedFile" class="file-name">{{ selectedFile.name }}</span>
          </div>

        </mat-dialog-content>

        <mat-dialog-actions align="end">
          <button mat-button type="button" (click)="dialogRef.close()">Annuler</button>
          <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">
            {{ isEditMode ? 'Sauvegarder' : 'Ajouter' }}
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
    .dialog-layout { display: flex; gap: 20px; padding: 10px; min-width: 900px; height: 550px;}
    
    /* Colonne Gauche */
    .form-section { flex: 1; display: flex; flex-direction: column; }
    .content-scrollable { overflow-y: auto; padding-top: 10px; }
    
    .full-width { width: 100%; }
    .row { display: flex; gap: 15px; }
    .row mat-form-field { flex: 1; }
    .time-input { flex: 0.5 !important; }

    .file-input-container { display: flex; align-items: center; gap: 10px; margin-top: 5px; }
    .file-name { font-size: 0.8rem; color: #666; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Colonne Droite (Preview) */
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
    .category-badge.daily { background: #ADD8E6; }
    .category-badge.evening { background: #FFD700; }

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
  
  form!: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isEditMode: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Package) {
    this.isEditMode = !!this.data;
  }

  ngOnInit() {
    const startDate = this.data?.valid_at ? new Date(this.data.valid_at) : new Date();
    const endDate = this.data?.expired_at ? new Date(this.data.expired_at) : new Date();

    this.form = this.fb.group({
      title: [this.data?.title || '', Validators.required],
      description: [this.data?.description || ''],
      price: [this.data?.price || 0, [Validators.required, Validators.min(0)]],
      quota: [this.data?.quota || 100, [Validators.required, Validators.min(1)]],
      category: [this.data?.category || 'general', Validators.required],
      
      valid_date: [startDate, Validators.required],
      valid_time: [this.formatTime(startDate), Validators.required],
      
      expired_date: [endDate, Validators.required],
      expired_time: [this.formatTime(endDate), Validators.required],

      festival_id: [this.data?.festival_id || 1] 
    });
  }

  private formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5);
  }

  private combineDateTime(dateVal: Date, timeVal: string): Date {
    const d = new Date(dateVal);
    const [hours, minutes] = timeVal.split(':').map(Number);
    d.setHours(hours, minutes);
    return d;
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
    if (this.form.valid) {
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