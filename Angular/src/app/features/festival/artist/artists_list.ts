import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';

import { ArtistService } from '../../../core/services/artist.service';
import { Artist } from '../../../core/models/artist';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-bio-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'DASHBOARD.BIO' | translate }}</h2>
    <mat-dialog-content>
      <p style="white-space: pre-wrap; line-height: 1.5;">{{ bio || 'Aucune biographie disponible.' }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'COMMON.CLOSE' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class BioDialogComponent {
  bio: string = inject(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-artists-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './artists_list.html',
  styleUrls: ['./artists_list.css']
})
export class ArtistsListComponent implements OnInit {
  private artistService = inject(ArtistService);
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  artists = signal<Artist[]>([]);
  isLoading = signal(true);
  
  serverErrors = signal<string[]>([]);

  displayedColumns: string[] = ['photo', 'name', 'genre', 'popularity', 'bio', 'actions'];

  ngOnInit(): void {
    this.loadArtists();
  }

  async loadArtists() {
    this.isLoading.set(true);
    this.serverErrors.set([]);
    
    try {
      const data = await firstValueFrom(this.artistService.getArtists());
      this.artists.set(data);
    } catch (error) {
      this.serverErrors.set(this.errorHandler.parseRailsErrors(error));
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
    this.dialog.open(BioDialogComponent, {
      data: bio,
      width: '400px'
    });
  }

  async deleteArtist(id: number) {
    if (confirm("Voulez-vous vraiment supprimer cet artiste ?")) {
      try {
        await firstValueFrom(this.artistService.deleteArtist(id));
        this.artists.update(list => list.filter(a => a.id !== id));
      } catch (error) {
        const errors = this.errorHandler.parseRailsErrors(error);
        alert("Impossible de supprimer l'artiste : \n" + errors.join('\n'));
      }
    }
  }

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }
}