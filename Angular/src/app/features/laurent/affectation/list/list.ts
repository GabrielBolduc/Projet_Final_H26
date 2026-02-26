import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Affectation } from '@core/models/affectation';
import { Task } from '@core/models/task';
import { AffectationService } from '@core/services/affectation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-list',
  imports: [MatButtonModule, MatCardModule, MatIconModule, CommonModule, TranslateModule,RouterLink],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class ListAffectationsComponent {

  private affectationService = inject(AffectationService);
  public translate = inject(TranslateService);

  taskId: number | null = null;
  constructor(private route: ActivatedRoute) {}

  affectations = signal<Affectation[]>([]);
  currentLang = signal<string>(this.formatLang(this.translate.getCurrentLang()));

  ngOnInit() {

    const idParam = this.route.snapshot.paramMap.get('id');

    const id = idParam ? Number(idParam) : null;
    this.taskId = id;
       this.affectationService.listAffectationsByTask(id).subscribe(data => { 
        console.log('Tâches reçues : ', data);
        this.affectations.set(data);
    });


     this.translate.onLangChange.subscribe((event) => {
      this.currentLang.set(this.formatLang(event.lang));
    });
  }

  private formatLang(lang: string | undefined): string {
    if (!lang) return 'en'; 
    return lang.split('-')[0];
  }

  handleClick(id: number) {
    

    this.affectationService.deleteAffectation(id).subscribe(data =>{ 
      console.log('affectation reçue : ', data)
    
    });
    this.affectationService.listAffectationsByTask(this.taskId!).subscribe(data => { 
      console.log('Affectations reçues : ', data);
      this.affectations.set(data);
    });

  }
}
