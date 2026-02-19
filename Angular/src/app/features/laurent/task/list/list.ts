import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Task } from '@core/models/task';
import { TaskService } from '@core/services/task.service';

@Component({
  selector: 'app-list',
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class TaskListComponent implements OnInit {

  private taskService = inject(TaskService);
  tasks = signal<Task[]>([]);

  ngOnInit() {
    this.taskService.listTasks().subscribe(data => { 
      console.log('Tâches reçues : ', data);
      this.tasks.set(data);
    });
  }

  isImage(fileUrl: string | undefined): boolean {
  if (!fileUrl) return false;

  return /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif)$/i.test(fileUrl);
  }

}