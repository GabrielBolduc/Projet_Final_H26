import { Component, computed, inject, signal } from '@angular/core';
import { AffectationService } from '@core/services/affectation.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Affectation } from '@core/models/affectation';
import { Task } from '@core/models/task';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FestivalService } from '@core/services/festival.service';
import { Festival } from '@core/models/festival';

@Component({
  selector: 'app-user-list',
  imports: [MatButtonModule, MatCardModule, MatIconModule, CommonModule, TranslateModule,RouterLink],
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
})
export class UserListAffectationComponent {


  private affectationService = inject(AffectationService);
  private festivalService = inject(FestivalService);
      public translate = inject(TranslateService);
      festivals = signal<Festival[]>([]);

  taskId: number | null = null;
  constructor(private route: ActivatedRoute) {}

  affectations = signal<Affectation[]>([]);
  currentLang = signal<string>(this.formatLang(this.translate.getCurrentLang()));

   currentFestival = computed(() => 
    this.festivals().find(f => f.status === 'ongoing')
  );

  ngOnInit() {

   
       this.affectationService.listAffectationsByUser(JSON.parse(localStorage.getItem('festify_user')!).id).subscribe(data => { 
        console.log('Tâches reçues : ', data);
        this.affectations.set(data);
    });


     this.translate.onLangChange.subscribe((event) => {
      this.currentLang.set(this.formatLang(event.lang));
    });

    this.festivalService.getFestivals().subscribe(data => { 
      console.log('Festivals reçus : ', data);
      this.festivals.set(data);
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
