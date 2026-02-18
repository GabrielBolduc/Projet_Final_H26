import { Component, inject, signal } from '@angular/core';
import { Task } from '@core/models/task';
import { TaskService } from '@core/services/task.service';

@Component({
  selector: 'app-list',
  imports: [],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class taskListComponent {

  private taskService = inject(TaskService);

  tasks = signal<Task[]>([]);

  ngOnInit() {

    this.taskService.listTasks().subscribe(data =>{ 
      console.log('taches reçu : ', data)
      this.tasks.set(data)
    });
    
  }





}
