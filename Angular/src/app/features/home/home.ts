import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from "@angular/router";
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { FestivalService } from '@core/services/festival.service';
import { Festival } from '@core/models/festival';

@Component({
    selector: 'app-home',
    templateUrl: './home.html',
    styleUrls: ['./home.css'],
    standalone: true,
    imports: [
      MatButtonModule, 
      MatIconModule, 
      MatCardModule,  
      MatProgressSpinnerModule,
      TranslateModule
    ]
})
export class Home implements OnInit {
    private festivalService = inject(FestivalService);

    ongoingFestival = signal<Festival | null>(null);
    isLoading = signal(true);

    ngOnInit(): void {
        this.loadCurrentFestival();
    }

    loadCurrentFestival(): void {
        this.festivalService.getFestivals().subscribe({
            next: (festivals) => {
                const ongoing = festivals.find(f => f.status === 'ongoing');
                this.ongoingFestival.set(ongoing || null);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erreur lors du chargement du festival', err);
                this.isLoading.set(false);
            }
        });
    }
}