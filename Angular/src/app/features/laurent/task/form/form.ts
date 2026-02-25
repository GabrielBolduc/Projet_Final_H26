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

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  existingImageUrl: string | null = null;

   
  form: FormGroup = new FormBuilder().group({
      reusable_task_id: [null],
      title: ['', Validators.required],
      description: [''],
      difficulty: [0, [Validators.required, Validators.min(0), Validators.max(5)]],
      priority: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  getPriorityArray(): number[] {
      return [1, 2, 3, 4, 5];
    }

  setPriority(value: number) {
      this.form.patchValue({ priority: value });
    }
  save() {

         const formData = new FormData();

          formData.append('task[title]', this.form.value.title);
          formData.append('task[description]', this.form.value.description);
          formData.append('task[difficulty]', this.form.value.difficulty);
          formData.append('task[priority]', this.form.value.priority);
          formData.append('task[reusable]', this.form.value.reusable);

        
        //this.editTask = {
          //title: this.form.value.title,
          //description: this.form.value.description,
          //difficulty: this.form.value.difficulty,
          //priority: this.form.value.priority,
          //reusable: this.form.value.reusable
        //};

      

        if (this.isEditMode && this.taskId) {
            this.taskService.updateTask(this.taskId, formData, this.selectedFile ||undefined ).subscribe(() => {
           
            });
             //this.router.navigate(['/tasks']);
        } else {
            this.taskService.createTask(formData, this.selectedFile ||undefined).subscribe(() => {
           
            });
             //this.router.navigate(['/tasks']);
        }
    }


    setDifficulty(value: number) {
        this.form.patchValue({ difficulty: value });
    }

    getStarArray(): number[] {
        return [1, 2, 3, 4, 5];
    }

}
