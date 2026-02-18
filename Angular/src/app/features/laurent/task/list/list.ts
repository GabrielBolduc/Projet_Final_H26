import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Task } from '@core/models/task';
import { TaskService } from '@core/services/task.service';

@Component({
  selector: 'app-list',
  imports: [CommonModule, DatePipe, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
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
