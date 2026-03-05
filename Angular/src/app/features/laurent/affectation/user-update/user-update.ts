import { Component, computed, inject, signal } from '@angular/core';
import { AffectationService } from '@core/services/affectation.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Affectation } from '@core/models/affectation';
import { Task } from '@core/models/task';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FestivalService } from '@core/services/festival.service';
import { Festival } from '@core/models/festival';
import { MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'app-user-update',
  imports: [MatButtonModule, MatCardModule, MatIconModule, CommonModule, TranslateModule],
  templateUrl: './user-update.html',
  styleUrl: './user-update.css',
})
export class UserUpdateAffectationComponent {

  private affectationService = inject(AffectationService);
  private router = inject(Router);

  affectation = signal<Affectation | null>(null);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
  
    const idParam = this.route.snapshot.paramMap.get('id');

    const id = idParam ? Number(idParam) : undefined;
    
       this.affectationService.getAffectation(id).subscribe(data => { 
        console.log('Tâches reçues : ', data);
        this.affectation.set(data);
    });


  }

  updateStartAffectation() {


    
    const idParam = this.route.snapshot.paramMap.get('id');

    const id = idParam ? Number(idParam) : undefined;

   

    const now = new Date();

    const formatted = this.formatForDatetimeLocal(now);

   const formData = new FormData();

    formData.append('affectation[user_id]',  String(this.affectation()?.user?.id!));
      formData.append('affectation[task_id]',  String(this.affectation()?.task?.id!));
      formData.append('affectation[festival_id]', String(this.affectation()?.festival.id!));
      formData.append('affectation[expected_start]',  String(this.affectation()?.expected_start));
      formData.append('affectation[expected_end]',  String(this.affectation()?.expected_end));
      formData.append('affectation[responsability]',  String(this.affectation()?.responsability));

   if(this.affectation()?.start) {
    formData.append('affectation[responsability]',  String(this.affectation()?.start));
     formData.append('affectation[end]', formatted);
   } else {
    formData.append('affectation[start]', formatted);
    
   }

       
        formData.append('affectation[start]', formatted);

      this.affectationService.updateAffectation(id, formData).subscribe(data => { 
                console.log('Affectation mise à jour : ', data);
       }

      );

       this.router.navigate(['affectations']);

  }

  updateEndAffectation() {


  }

  formatForDatetimeLocal(date: Date): string {

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

}
