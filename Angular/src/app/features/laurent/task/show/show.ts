import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '@core/models/task';
import { TaskPayload } from '@core/models/task-payload';
import { TaskService } from '@core/services/task.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-show',
  imports: [MatCardModule, MatButtonModule,MatIconModule,CommonModule ],
  templateUrl: './show.html',
  styleUrl: './show.css',
})
export class TaskShowComponent {

  

  private taskService = inject(TaskService);
  private router = inject(Router);

  
  editTask: TaskPayload = new TaskPayload(
  "Edited title",
  "Edited description",
  2,        // difficulty
  3,        // priority
  true      // reusable
  );


  task = signal<Task | null>(null);

   constructor(private route: ActivatedRoute){}

  ngOnInit() {

    const idParam = this.route.snapshot.paramMap.get('id');

    const id = idParam ? Number(idParam) : null;


    this.taskService.getTask(id).subscribe(data =>{ 
      console.log('tache reçu : ', data)
      this.task.set(data)
       console.log('tache initialisé : ', this.task())
    });
    
  }
  
  handleClick() {

    const idParam = this.route.snapshot.paramMap.get('id');

    const id = idParam ? Number(idParam) : null;

    this.taskService.deleteTask(id).subscribe(data =>{ 
      console.log('tache reçu : ', data)
    
    });
    this.router.navigate(['/tasks']);

  }

  handleEditClick() {

    const idParam = this.route.snapshot.paramMap.get('id');

    const id = idParam ? Number(idParam) : null;

    this.router.navigate([`/tasks/${id}/edit`]);

  }

  getStars(difficulty: number | undefined): number[] {
  if (!difficulty) return [];
  return Array(difficulty).fill(0);
  }

  getEmptyStars(difficulty: number | undefined): number[] {
    if (!difficulty) return Array(5).fill(0);
    return Array(5 - difficulty).fill(0);
  }

  isImage(fileUrl: string | undefined): boolean {
  if (!fileUrl) return false;

  return /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/i.test(fileUrl);
  }



}
