import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { TaskService } from '@core/services/task.service';
import { TaskReport } from '@core/models/task-report';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-tache',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, MatIconModule, MatTabsModule,MatCard],
  templateUrl: './tache.html',
  styleUrls: ['./tache.css']
})
export class TacheComponent {
  public translate = inject(TranslateService);

  public taskService = inject(TaskService)



  taskReport = signal<TaskReport | null>(null);

  ngOnInit()
  {

      this.taskService.raport().subscribe(data =>{ 
      this.taskReport.set(data)
    });




  }

}