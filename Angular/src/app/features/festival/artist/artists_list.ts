import { Component, OnInit, OnDestroy, inject, signal, ViewChild, TemplateRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { firstValueFrom, Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ArtistService } from '../../../core/services/artist.service';
import { Artist } from '../../../core/models/artist';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-artists-list',
  standalone: true,
  imports: [
    CommonModule, RouterModule, TranslateModule, MatTableModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatDialogModule, MatSnackBarModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, FormsModule
  ],
  templateUrl: './artists_list.html',
  styleUrls: ['./artists_list.css']
})
export class ArtistsListComponent implements OnInit, OnDestroy {
  @ViewChild('bioDialogTemplate') bioDialogTemplate!: TemplateRef<any>;
  @ViewChild('confirmDeleteTemplate') confirmDeleteTemplate!: TemplateRef<any>;

  private artistService = inject(ArtistService);
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  public translate = inject(TranslateService);

  // --- Signaux d'état ---
  artists = signal<Artist[]>([]);
  isLoading = signal(true);
  serverErrors = signal<string[]>([]);

  // --- Signaux pour les filtres ---
  searchQuery = signal<string>('');
  filterGenre = signal<string | null>(null);

  private initialized = false;
  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  availableGenres = signal<string[]>([])
  displayedColumns: string[] = ['photo', 'name', 'genre', 'popularity', 'bio', 'actions'];
  constructor() {
    effect(() => {
      if (!this.initialized) return;
      const queryParams = {
        search: this.searchQuery() || null,
        genre: this.filterGenre() || null
      };
      this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge', replaceUrl: true });
    });

    effect(async () => {
      this.isLoading.set(true);
      try {
        const params: any = {};
        if (this.searchQuery()) params.search = this.searchQuery();
        if (this.filterGenre()) params.genre = this.filterGenre();

        // Plus besoin d'envoyer de paramètre "sort", le backend le fait automatiquement
        const data = await firstValueFrom(this.artistService.getArtists(params));
        this.artists.set(data);
      } catch (error) {
        this.showErrorsAsSnackBar(error);
      } finally {
        this.isLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    firstValueFrom(this.artistService.getGenres())
    .then(genres => this.availableGenres.set(genres))
    .catch(err => console.error(this.translate.instant('ARTIST_LIST.ERROR_GENRE'), err))

    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(val => this.searchQuery.set(val));

    const params = this.route.snapshot.queryParams;
    if (params['search']) this.searchQuery.set(params['search']);
    if (params['genre']) this.filterGenre.set(params['genre']);

    this.initialized = true;
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  updateSearch(val: string) { this.searchSubject.next(val); }
  updateGenre(genre: string | null) { this.filterGenre.set(genre); }

  navigateToAdd() { this.router.navigate(['/admin/artistes/ajout']); }
  navigateToEdit(id: number) { this.router.navigate(['/admin/artistes/edition', id]); }

  openBio(bio: string | undefined) {
    this.dialog.open(this.bioDialogTemplate, { data: bio, width: '450px', autoFocus: false });
  }

  async deleteArtist(id: number) {
    const dialogRef = this.dialog.open(this.confirmDeleteTemplate, { width: '400px' });
    const confirmed = await firstValueFrom(dialogRef.afterClosed());

    if (confirmed) {
      try {
        await firstValueFrom(this.artistService.deleteArtist(id));
        this.artists.update(list => list.filter(a => a.id !== id));
        this.snackBar.open(this.translate.instant('ARTIST.DELETE_SUCCESS'), this.translate.instant('COMMON.CLOSE'), { duration: 3000 });
      } catch (error) {
        this.showErrorsAsSnackBar(error);
      }
    }
  }

  private showErrorsAsSnackBar(err: any): void {
    const errors = this.errorHandler.parseRailsErrors(err);
    if (errors.length > 0) {
      this.snackBar.open(errors.join(' | '), this.translate.instant('COMMON.CLOSE'), { duration: 5000 });
    }
  }

  getStarsArray(): number[] { return [1, 2, 3, 4, 5]; }
}