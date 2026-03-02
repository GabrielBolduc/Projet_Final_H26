import { Component, OnInit, inject, signal, computed, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field'; 
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { FestivalService } from '../../../core/services/festival.service';
import { Festival } from '../../../core/models/festival';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [
    CommonModule, 
    DatePipe,
    FormsModule,
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDividerModule, 
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule, 
    RouterModule
  ],
  templateUrl: './administration.html',
  styleUrls: ['./administration.css']
})
export class AdministrationComponent implements OnInit {
  @ViewChild('confirmDialogTemplate') confirmDialogTemplate!: TemplateRef<any>;
  @ViewChild('finishDialogTemplate') finishDialogTemplate!: TemplateRef<any>;
  @ViewChild('notesDialogTemplate') notesDialogTemplate!: TemplateRef<any>;

  private festivalService = inject(FestivalService);
  private errorHandler = inject(ErrorHandlerService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService); 

  festivals = signal<Festival[]>([]);

  currentFestival = computed(() => 
    this.festivals().find(f => f.status === 'ongoing')
  );

  drafts = computed(() =>
    this.festivals().filter(f => f.status === 'draft')
  );

  archives = computed(() => 
    this.festivals().filter(f => f.status === 'completed')
  );

  ngOnInit(): void {
    this.loadFestivals();
  }

  async loadFestivals(): Promise<void> {
    try {
      const festivalsList = await firstValueFrom(this.festivalService.getFestivals());
      this.festivals.set(festivalsList);
    } catch (err) {
      this.showErrorsAsSnackBar(err);
    }
  }

  showNotes(festival: Festival):void {
    this.dialog.open(this.notesDialogTemplate, {
      width: '500px',
      data: festival
    })
  }

  async openFinishDialog(festival: Festival): Promise<void> {
    const finishData = {
      satisfaction: 5,
      other_income: 0,
      other_expense: 0,
      comment: ''
    };

    const dialogRef = this.dialog.open(this.finishDialogTemplate, {
      width: '450px',
      data: { name: festival.name, ...finishData }
    });

    const result = await firstValueFrom(dialogRef.afterClosed());

    if (result) {
      try {
        await firstValueFrom(this.festivalService.updateFestival(festival.id, {
          ...result,
          status: 'completed'
        }));
        
        this.snackBar.open(
          this.translate.instant('FESTIVAL.ARCHIVED_SUCCESS'), 
          this.translate.instant('COMMON.CLOSE'), 
          {duration: 3000}
        );
        await this.loadFestivals();
      } catch (err) {
        this.showErrorsAsSnackBar(err);
      }
    }
  }

  navigateToAdd(): void {
    this.router.navigate(['/admin/festivals/new']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/admin/festivals', id, 'edit']);
  }

  async deleteFestival(festival: Festival): Promise<void> {
    if (festival.status === 'ongoing') {
      this.snackBar.open(
        this.translate.instant('FESTIVAL.DELETE_ONGOING_ERROR'), 
        this.translate.instant('COMMON.CLOSE'), 
        { duration: 5000 }
      );
      return;
    }

    const dialogRef = this.dialog.open(this.confirmDialogTemplate, { width: '400px' });
    const result = await firstValueFrom(dialogRef.afterClosed());

    if (result) {
      try {
        await firstValueFrom(this.festivalService.deleteFestival(festival.id));
        
        this.snackBar.open(
          this.translate.instant('FESTIVAL.DELETE_SUCCESS'), 
          this.translate.instant('COMMON.CLOSE'), 
          { duration: 3000 }
        );
        await this.loadFestivals();
      } catch (err) {
        this.showErrorsAsSnackBar(err);
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
}