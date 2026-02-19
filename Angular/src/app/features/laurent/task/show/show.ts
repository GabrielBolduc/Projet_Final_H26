import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Task } from '@core/models/task';
import { TaskPayload } from '@core/models/task-payload';
import { TaskService } from '@core/services/task.service';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';



@Component({
  selector: 'app-show',
  imports: [MatCardModule, MatButtonModule, ],
  templateUrl: './show.html',
  styleUrl: './show.css',
})
export class TaskShowComponent {

  

  private taskService = inject(TaskService);
  
  editTask: TaskPayload = new TaskPayload(
  "Edited title",
  "Edited description",
  2,        // difficulty
  3,        // priority
  true      // reusable
  );


  task = signal<Task[]>([]);
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

  }

  handleEditClick() {

    const idParam = this.route.snapshot.paramMap.get('id');

    const id = idParam ? Number(idParam) : null;

    this.taskService.updateTask(id,this.editTask).subscribe(data =>{ 
      
    
    });

  }


}
