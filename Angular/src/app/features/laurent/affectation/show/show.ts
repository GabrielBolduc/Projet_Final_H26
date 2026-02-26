import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { Affectation } from '@core/models/affectation';
import { AffectationService } from '@core/services/affectation.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-show',
  imports: [ MatButtonModule, MatCardModule, MatIconModule, CommonModule, TranslateModule,MatDivider ],
  templateUrl: './show.html',
  styleUrl: './show.css',
})
export class ShowAffectationComponent {

  private affectationService = inject(AffectationService);
  private route = inject(ActivatedRoute);

  affectation = signal<Affectation | null>(null);


  ngOnInit() {
    
    const idParam = this.route.snapshot.paramMap.get('affectationId');

    const id = idParam ? Number(idParam) : null;

       this.affectationService.getAffectation(id).subscribe(data => { 
        console.log('Affectation reçue : ', data);
        this.affectation.set(data);
    });
  }

   getStars(difficulty: number | undefined): number[] {
    if (!difficulty) return [];
    return Array(difficulty).fill(0);
    }

  getEmptyStars(difficulty: number | undefined): number[] {
    if (!difficulty) return Array(5).fill(0);
    return Array(5 - difficulty).fill(0);
  }

}
