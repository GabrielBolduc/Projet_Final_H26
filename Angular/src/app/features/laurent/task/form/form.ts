import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Task } from '@core/models/task';
import { TaskService } from '@core/services/task.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TaskPayload } from '@core/models/task-payload';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';



@Component({
  selector: 'app-form',
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule,
    MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatIconModule,MatCheckboxModule, TranslateModule
  ], 
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class TaskFormComponent {

   private taskService = inject(TaskService);

   taskId: number |null=null;
   isEditMode = false;

  task = signal<Task | null>(null);
  reusableTasks = signal<Task[]>([]);
  editTask: TaskPayload | null = null;
   
    form: FormGroup = new FormBuilder().group({
        reusable_task_id: [null],
        title: ['', Validators.required],
        description: [''],
        difficulty: [0, Validators.required],
        priority: [1, [Validators.required, Validators.min(1)]],
        reusable: [false],  
        file: [null]
        });


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

     this.taskService.listTasks().subscribe(data => { 
      console.log('Tâches reçues : ', data);
      this.reusableTasks.set(data);
    });


        this.form.get('reusable_task_id')?.valueChanges.subscribe(taskId => {
        if (!taskId) return;

        const selectedTask = this.reusableTasks().find(t => t.id === taskId);

        if (!selectedTask) return;

        this.form.patchValue({
        title: selectedTask.title,
        description: selectedTask.description,
        difficulty: selectedTask.difficulty,
        priority: selectedTask.priority,
        reusable: selectedTask.reusable
        });
    });

    
  }

  selectedFile: File | null = null;

    onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
        this.selectedFile = input.files[0];
    }
    }


    save() {

         //const formData = new FormData();

          //  formData.append("file", this.selectedFile!);
           // formData.append("title", this.form.value.title);
          //  formData.append("description", this.form.value.description);
          //  formData.append("difficulty", this.form.value.difficulty);
          //  formData.append("priority", this.form.value.priority);
          //  formData.append("reusable", this.form.value.reusable);
        
        this.editTask = {
          title: this.form.value.title,
          description: this.form.value.description,
          difficulty: this.form.value.difficulty,
          priority: this.form.value.priority,
          reusable: this.form.value.reusable
        };

      

        console.log('Données à envoyer : ', this.editTask);
        if (this.isEditMode && this.taskId) {
            this.taskService.updateTask(this.taskId, this.editTask).subscribe(() => {
           
            });
             this.router.navigate(['/tasks']);
        } else {
            this.taskService.createTask(this.editTask).subscribe(() => {
           
            });
             this.router.navigate(['/tasks']);
        }
    }


    setDifficulty(value: number) {
        this.form.patchValue({ difficulty: value });
    }

    getStarArray(): number[] {
        return [1, 2, 3, 4, 5];
    }

}
