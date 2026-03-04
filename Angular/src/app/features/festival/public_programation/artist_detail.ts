import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; 
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { firstValueFrom } from 'rxjs';
import { ArtistService } from '../../../../app/core/services/artist.service';
import { Artist } from '../..../../../../core/models/artist';

@Component({
  selector: 'app-artist-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule
  ],
  templateUrl: './artist_detail.html',
  styleUrls: ['./artist_detail.css']
})
export class ArtistDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private artistService = inject(ArtistService);
  private location = inject(Location);

  artist = signal<Artist | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.loadArtist(Number(id));
    } else {
      this.error.set("Artiste non trouvé");
      this.isLoading.set(false);
    }
  }

  async loadArtist(id: number) {
    try {
      this.isLoading.set(true);
      const data = await firstValueFrom(this.artistService.getArtist(id));
      this.artist.set(data);
    } catch (err) {
      console.error(err);
      this.error.set("Impossible de charger les détails de l'artiste.");
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack(): void {
    this.location.back();
  }
}