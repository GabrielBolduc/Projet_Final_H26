import { Component, OnInit, TemplateRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Task } from '@core/models/task';
import { TaskService } from '@core/services/task.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';



@Component({
  selector: 'app-list',
  imports: [MatFormFieldModule,
MatInputModule,
MatSelectModule,TranslateModule,CommonModule, MatDialogModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class TaskListComponent implements OnInit {

    @ViewChild('confirmDialogTemplate') confirmDialogTemplate!: TemplateRef<any>;


  private taskService = inject(TaskService);
  private dialog = inject(MatDialog);
  private errorHandler = inject(ErrorHandlerService); 
  private snackBar = inject(MatSnackBar);

  tasks = signal<Task[]>([]);

  search = signal('');
  order = signal('desc');
  status = signal('');

  constructor(
 private router: Router,
 private route: ActivatedRoute
) {}

  ngOnInit() {
    this.taskService.listTasks().subscribe(data => { 
      console.log('Tâches reçues : ', data);
      this.tasks.set(data);
    });
  }


  handleEditClick(id: number) {

    this.router.navigate([`/tasks/${id}/edit`]);

  }

  isImage(fileUrl: string | undefined): boolean {
  if (!fileUrl) return false;

  return /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/i.test(fileUrl);
  }


    async handleClick(id: number): Promise<void> {
      
  
      const dialogRef = this.dialog.open(this.confirmDialogTemplate, { width: '400px' });
      const result = await firstValueFrom(dialogRef.afterClosed());
  
      if (result) {
        try {
          await firstValueFrom(this.taskService.deleteTask(id));
          this.snackBar.open('tâche supprimé avec succès.', 'Fermer', { duration: 3000 });
          await this.taskService.listTasks().subscribe(data => { 
              console.log('Tâches reçues : ', data);
              this.tasks.set(data);
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

  updateQuery(params: any) {

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge'
    });

  }

  loadTasks() {

    const formData = new FormData();

        formData.append('[title]',this.search());
        formData.append('[description]',this.order());
        formData.append('[difficulty]', this.status());
      


    this.taskService.listTasks(this.search(),this.order(),this.status()).subscribe(data => {

    this.tasks.set(data);

  });

}

}