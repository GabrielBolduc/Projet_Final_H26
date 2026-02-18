import { Component, inject } from '@angular/core';
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

  tasks: Task[] = [];

  ngOnInit() {
    
  }





}
