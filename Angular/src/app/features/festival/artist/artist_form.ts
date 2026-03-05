import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { Artist } from '../../../core/models/artist';
import { ArtistService } from '../../../core/services/artist.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { MatCardModule } from '@angular/material/card';
import { TranslateModule, TranslateService } from '@ngx-translate/core'; 
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-artist-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, 
    MatIconModule, MatProgressSpinnerModule, MatCardModule, TranslateModule,
    MatSnackBarModule
  ],
  templateUrl: './artist_form.html',
  styleUrls: ['./artist_form.css']
})
export class ArtistFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private artistService = inject(ArtistService);
  private errorHandler = inject(ErrorHandlerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar); 
  private translate = inject(TranslateService); 

  artistForm: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  serverErrors = signal<string[]>([]);
  
  imagePreview = signal<string | null>(null);
  selectedFile: File | null = null;

  constructor() {
    this.artistForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      genre: ['', [Validators.required, Validators.maxLength(50)]],
      bio: ['', [Validators.maxLength(1600)]],
      popularity: [3, [Validators.required, Validators.min(0), Validators.max(5)]]
    });
  }

  get f() { return this.artistForm.controls; }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.loadArtist(id);
    }
  }

  async loadArtist(id: number) {
    this.isLoading.set(true);
    try {
      const artist = await firstValueFrom(this.artistService.getArtist(id));
      this.artistForm.patchValue(artist);
      if (artist.image_url) {
        this.imagePreview.set(artist.image_url);
      }
    } catch (error) {
      this.serverErrors.set(this.errorHandler.parseRailsErrors(error));
      this.snackBar.open(
        this.translate.instant('ARTIST.LOAD_ERROR'), 
        this.translate.instant('COMMON.CLOSE'), 
        { duration: 4000 }
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  setPopularity(val: number) {
    this.artistForm.patchValue({ popularity: val });
    this.artistForm.markAsDirty();
  }

  async onSubmit() {
    if (this.artistForm.invalid) return;

    this.isSaving.set(true);
    this.serverErrors.set([]);

    const artistData: Partial<Artist> = {
      name: this.artistForm.value.name,
      genre: this.artistForm.value.genre,
      bio: this.artistForm.value.bio,
      popularity: this.artistForm.value.popularity
    };

    try {
      if (this.isEditMode()) {
        const id = this.route.snapshot.params['id'];
        await firstValueFrom(this.artistService.updateArtist(id, artistData, this.selectedFile || undefined));

        this.snackBar.open(
          this.translate.instant('ARTIST.EDIT_SUCCESS') || 'Artiste modifié', 
          this.translate.instant('COMMON.CLOSE'), 
          { duration: 3000 }
        );
      } else {
        await firstValueFrom(this.artistService.createArtist(artistData, this.selectedFile || undefined));
        
        this.snackBar.open(
          this.translate.instant('ARTIST.ADD_SUCCESS') || 'Artiste ajouté', 
          this.translate.instant('COMMON.CLOSE'), 
          { duration: 3000 }
        );
      }
      this.router.navigate(['/admin/artistes']);
    } catch (error) {
      const errors = this.errorHandler.parseRailsErrors(error);
      this.serverErrors.set(errors);
      
      const errorMessage = errors.length > 0 ? errors[0] : (this.translate.instant('ARTIST.SAVE_ERROR') || 'Erreur lors de la sauvegarde');
      this.snackBar.open(
        errorMessage, 
        this.translate.instant('COMMON.UNDERSTOOD'), 
        { duration: 6000 }
      );
    } finally {
      this.isSaving.set(false);
    }
  }
}