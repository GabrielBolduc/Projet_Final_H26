import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card'; // <-- Ajoute cette ligne
import { FestivalService } from '../../../core/services/festival.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-festival-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    TranslateModule,
    MatCardModule
  ],
  templateUrl: './festival-form.html',
  styleUrls: ['./festival-form.css']
})
export class FestivalFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private festivalService = inject(FestivalService);
  private errorHandler = inject(ErrorHandlerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  isLoading = signal<boolean>(false);
  isEditMode = signal<boolean>(false);
  festivalId = signal<number | null>(null);
  
  serverErrors = signal<string[]>([]);

  festivalForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    start_at: ['', Validators.required],
    end_at: ['', Validators.required],
    status: ['draft', Validators.required],
    address: ['', Validators.required],
    daily_capacity: [null, [Validators.required, Validators.min(1)]],
    satisfaction: [null, [Validators.min(0), Validators.max(5)]],
    other_income: [null],
    other_expense: [null],
    latitude: [null],
    longitude: [null]
  });

  statusOptions = [
    { value: 'draft', label: 'Brouillon' },
    { value: 'ongoing', label: 'En cours' },
    { value: 'completed', label: 'Terminé' }
  ];

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    
    if (idParam) {
      this.isEditMode.set(true);
      this.festivalId.set(Number(idParam));
      await this.loadFestivalData(this.festivalId()!);
    }
  }

  async loadFestivalData(id: number): Promise<void> {
    this.isLoading.set(true);
    this.serverErrors.set([]); // On nettoie les erreurs au chargement
    try {
      const festival = await firstValueFrom(this.festivalService.getFestival(id));
      this.festivalForm.patchValue(festival);
    } catch (err) {
      this.handleServerErrors(err);
      this.router.navigate(['/admin/festivals']);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.festivalForm.invalid) {
      this.festivalForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.serverErrors.set([]); // On nettoie les erreurs précédentes avant de soumettre

    const formData = this.festivalForm.value;

    try {
      if (this.isEditMode()) {
        await firstValueFrom(this.festivalService.updateFestival(this.festivalId()!, formData));
        this.snackBar.open('Festival mis à jour avec succès.', 'Fermer', { duration: 3000 });
      } else {
        await firstValueFrom(this.festivalService.createFestival(formData));
        this.snackBar.open('Festival créé avec succès.', 'Fermer', { duration: 3000 });
      }
      this.router.navigate(['/admin/festivals']);
    } catch (err) {
      // Si on a l'erreur "Il y a déjà un festival en cours", elle ira directement dans serverErrors
      this.handleServerErrors(err);
    } finally {
      this.isLoading.set(false);
    }
  }

  // 🔥 LA MÉTHODE MISE À JOUR : Elle peuple le signal serverErrors et affiche le SnackBar
  private handleServerErrors(err: any): void {
    const errors = this.errorHandler.parseRailsErrors(err);
    if (errors.length > 0) {
      this.serverErrors.set(errors); // Met à jour le HTML (encadré rouge en haut)
      this.snackBar.open('Erreur lors de la validation.', 'Fermer', { duration: 5000, panelClass: ['error-snackbar'] });
    } else {
      this.serverErrors.set(["Une erreur inattendue s'est produite."]);
    }
  }
}