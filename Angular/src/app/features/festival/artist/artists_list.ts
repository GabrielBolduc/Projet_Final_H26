import { Component, OnInit, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { ArtistService } from '../../../core/services/artist.service';
import { Artist } from '../../../core/models/artist';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-artists-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, MatTableModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule
  ],
  templateUrl: './artists_list.html',
  styleUrls: ['./artists_list.css']
})
export class ArtistsListComponent implements OnInit {
  @ViewChild('bioDialogTemplate') bioDialogTemplate!: TemplateRef<any>;
  @ViewChild('confirmDeleteTemplate') confirmDeleteTemplate!: TemplateRef<any>;

  private artistService = inject(ArtistService);
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);

  artists = signal<Artist[]>([]);
  isLoading = signal(true);
  serverErrors = signal<string[]>([]);

  displayedColumns: string[] = ['photo', 'name', 'genre', 'popularity', 'bio', 'actions'];

  ngOnInit(): void {
    this.loadArtists();
  }

  async loadArtists() {
    this.isLoading.set(true);
    try {
      const data = await firstValueFrom(this.artistService.getArtists());
      this.artists.set(data);
    } catch (error) {
      this.showErrorsAsSnackBar(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  navigateToAdd() {
    this.router.navigate(['/admin/artistes/ajout']); 
  }

  navigateToEdit(id: number) {
    this.router.navigate(['/admin/artistes/edition', id]);
  }

  openBio(bio: string | undefined) {
    this.dialog.open(this.bioDialogTemplate, {
      data: bio,
      width: '450px',
      autoFocus: false
    });
  }

  async deleteArtist(id: number) {
    const dialogRef = this.dialog.open(this.confirmDeleteTemplate, { width: '400px' });
    const confirmed = await firstValueFrom(dialogRef.afterClosed());

    if (confirmed) {
      try {
        await firstValueFrom(this.artistService.deleteArtist(id));
        
        this.artists.update(list => list.filter(a => a.id !== id));
        
        this.snackBar.open(
          this.translate.instant('ARTIST.DELETE_SUCCESS'), 
          this.translate.instant('COMMON.CLOSE'), 
          { duration: 3000 }
        );
      } catch (error) {
        this.showErrorsAsSnackBar(error);
      }
    }
  }

  private showErrorsAsSnackBar(err: any): void {
    const errors = this.errorHandler.parseRailsErrors(err);
    if (errors.length > 0) {
      this.snackBar.open(
        errors.join(' | '), 
        this.translate.instant('COMMON.CLOSE'), 
        { duration: 5000 }
      );
    }
  }

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }
}