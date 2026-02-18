import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Task } from '@core/models/task';
import { TaskService } from '@core/services/task.service';
import { ListBadgeComponent } from '../list-badge/list-badge';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  imports: [ListBadgeComponent,CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class taskListComponent {




  private taskService = inject(TaskService);

  tasks = signal<Task[]>([]);

  constructor (private router: Router){

  }

  
  ngOnInit() {

    this.taskService.listTasks().subscribe(data =>{ 
      console.log('taches reçu : ', data)
      this.tasks.set(data)
    });
    
  }

  handletaskClicked(id: number) {
      this.router.navigate(['/tasks', id])

  }



}
