import { Component, computed, inject, Input, signal, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Affectation } from '@core/models/affectation';
import { Task } from '@core/models/task';
import { AffectationService } from '@core/services/affectation.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FestivalService } from '@core/services/festival.service';
import { Festival } from '@core/models/festival';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-list',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatDialogModule,MatIconModule, CommonModule, TranslateModule,RouterLink],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class ListAffectations {
  

  @ViewChild('confirmDialogTemplate') confirmDialogTemplate!: TemplateRef<any>;

  private affectationService = inject(AffectationService);
  private festivalService = inject(FestivalService);
  private dialog = inject(MatDialog);
  private errorHandler = inject(ErrorHandlerService); 
  public translate = inject(TranslateService);
  private snackBar = inject(MatSnackBar);

   @Input() taskId!: number | undefined;

  festivals = signal<Festival[]>([]);

  
  constructor(private route: ActivatedRoute) {}

  affectations = signal<Affectation[]>([]);
  currentLang = signal<string>(this.formatLang(this.translate.getCurrentLang()));

   currentFestival = computed(() => 
    this.festivals().find(f => f.status === 'ongoing')
  );

  ngOnInit() {

    
       this.affectationService.listAffectationsByTask(this.taskId).subscribe(data => { 
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


    async handleClick(id: number): Promise<void> {
      
  
      const dialogRef = this.dialog.open(this.confirmDialogTemplate, { width: '400px' });
      const result = await firstValueFrom(dialogRef.afterClosed());
  
      if (result) {
        try {
          await firstValueFrom(this.affectationService.deleteAffectation(id));
          this.snackBar.open('tâche supprimé avec succès.', 'Fermer', { duration: 3000 });
          await this.affectationService.listAffectationsByTask(this.taskId!).subscribe(data => { 
              console.log('Tâches reçues : ', data);
              this.affectations.set(data);
          });
        } catch (err) {
          this.showErrorsAsSnackBar(err);
        }
      }
    }

    private showErrorsAsSnackBar(err: any): void {
    const errors = this.errorHandler.parseRailsErrors(err);
    if (errors.length > 0) {
      this.snackBar.open(errors.join(' | '), 'Fermer', { duration: 5000 });
    }
  }
}
