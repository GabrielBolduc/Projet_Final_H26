import { Component, inject, signal } from '@angular/core';
import { Task } from '@core/models/task';
import { TaskService } from '@core/services/task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskPayload } from '@core/models/task-payload';


@Component({
  selector: 'app-form',
  imports: [],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class TaskFormComponent {

   private taskService = inject(TaskService);

   taskId: number |null=null;
   isEditMode = false;

    task = signal<Task[]>([]);
   editTask: TaskPayload = new TaskPayload(
        "Edited title",
        "Edited description",
        2,        // difficulty
        3,        // priority
        true      // reusable
        );
   
  constructor(
        private route: ActivatedRoute,
        private router: Router
      )
      {}

  ngOnInit() {
           const idParam = this.route.snapshot.paramMap.get('id');

            
            const id = idParam ? Number(idParam) : null;

            if (id) {
                this.isEditMode = true;
                this.taskId = Number(id);

                this.taskService.getTask(id).subscribe(data =>{ 
                    console.log('tache reçu : ', data)
                    this.task.set(data)
                    console.log('tache initialisé : ', this.task)
                  });

            }
  }

  save() {

    
       
        if (this.isEditMode) {
            // EDIT
            this.taskService.updateTask(this.taskId, this.editTask).subscribe(success => {
                if (!success) {
                    console.log('Update failed');
                    return;
                }
            });
            this.router.navigate(['/taches']);
            
        } else {
            // CREATE
            this.taskService.createTask(this.editTask).subscribe(success => {
                if (!success) {
                    console.log('Update failed');
                    return;
                }
   
            }); 
            
            this.router.navigate(['/taches']);
        }
    }
}
