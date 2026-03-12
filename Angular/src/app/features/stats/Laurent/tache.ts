import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TaskService } from '@core/services/task.service';
import { TaskReport } from '@core/models/task-report';
import { MatCard } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-tache',
  standalone: true,
  imports: [CommonModule, MatSelectModule, MatFormFieldModule ,MatTableModule , RouterModule, TranslateModule, MatIconModule, MatTabsModule,MatCard],
  templateUrl: './tache.html',
  styleUrls: ['./tache.css']
})
export class TacheComponent {
  public translate = inject(TranslateService);

  public taskService = inject(TaskService)

  public taskCount = signal<number>(0);
  public taskCompleatedCount = signal<number>(0);
  public taskOngoingCount = signal<number>(0);
  public taskAwatingCount = signal<number>(0);

  taskReport = signal<TaskReport[]>([]);
  statusFilter = signal<string>('all');
  

  ngOnInit() {
    this.taskService.raport().subscribe(data => { 
      this.taskReport.set(data);

      const tasks = data;

      this.taskCount.set(tasks.length);

      this.taskCompleatedCount.set(
        tasks.filter(t => t.completed).length
      );

      this.taskOngoingCount.set(
        tasks.filter(t => t.ongoing).length
      );

      this.taskAwatingCount.set(
        tasks.filter(t => t.awaiting).length
      );
    });
  }

  displayedColumns: string[] = [
    'title',
    'status',
    'affectations',
    'start',
    'end'
  ];

  getStatus(task: TaskReport) {
    if (task.completed) return 'Completed';
    if (task.ongoing) return 'Ongoing';
    if (task.awaiting) return 'Waiting';
    return '';
  }

  getEarliestStart(task: TaskReport) {
    if (!task.affectations?.length) return null;

    const starts = task.affectations
      .filter(a => a.start !== null)
      .map(a => new Date(a.start!).getTime());

    return starts.length ? new Date(Math.min(...starts)) : null;
  }

  getEarliestEnd(task: TaskReport) {
    if (!task.affectations?.length) return null;

    const ends = task.affectations
      .filter(a => a.end !== null)
      .map(a => new Date(a.end!).getTime());

    return ends.length ? new Date(Math.min(...ends)) : null;
  }

  filteredTasks() {
    const status = this.statusFilter();
    const tasks = this.taskReport();

    if (status === 'all') return tasks;
    if (status === 'completed') return tasks.filter(t => t.completed);
    if (status === 'ongoing') return tasks.filter(t => t.ongoing);
    if (status === 'awaiting') return tasks.filter(t => t.awaiting);

    return tasks;
  }
  
}