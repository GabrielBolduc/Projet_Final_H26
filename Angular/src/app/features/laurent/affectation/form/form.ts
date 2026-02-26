import { Component, computed, inject, signal } from '@angular/core';
import { Affectation } from '@core/models/affectation';
import { User } from '@core/models/user';
import { AffectationService } from '@core/services/affectation.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDividerModule } from '@angular/material/divider';
import { FestivalService } from '@core/services/festival.service';
import { Festival } from '@core/models/festival';
import { ErrorHandlerService } from '@core/services/error-handler.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-form',
  imports: [MatDividerModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule, MatIconModule,MatCheckboxModule, TranslateModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class FormAffectationComponent {
    isEditMode = false;
    users = signal<User[]>([]);
    affectation = signal<Affectation | null>(null);
    searchName = signal('');
    searchAbility = signal('');
    searchTerm = signal('');
    private affectationService = inject(AffectationService);
    private festivalService = inject(FestivalService);
    private errorHandler = inject(ErrorHandlerService);
    
    

    form: FormGroup = new FormBuilder().group({
    user_id: ['', Validators.required],

    expected_start: ['', Validators.required],

    expected_end: ['', Validators.required],

    responsability: [
      '',
      [Validators.required, Validators.maxLength(255)]
    ]

  }, {
    validators: this.endAfterStartValidator
  });

  festivals = signal<Festival[]>([]);

  currentFestival = computed(() => 
    this.festivals().find(f => f.status === 'ongoing')
  );

    constructor( private route: ActivatedRoute, private router: Router) {}

    ngOnInit() {

      const idParam = this.route.snapshot.paramMap.get('affectationId');

    
      const id = idParam ? Number(idParam) : null;

      console.log( id);

      if (id) {
          this.isEditMode = true;
        
          this.affectationService.getAffectation(id).subscribe(data => { 
          console.log('Affectation reçue : ', data);
          this.affectation.set(data);

           this.form.patchValue({
              expected_start: this.formatForDatetimeLocal(data.expected_start),
              expected_end: this.formatForDatetimeLocal(data.expected_end),
              responsability: data.responsability,
              user_id: data.user.id
              
            });

          });
        
      }

      this.affectationService.getStaffList().subscribe(data => { 
      console.log('Utilisateurs reçus : ', data);
      this.users.set(data);
      });

     this.festivalService.getFestivals().subscribe(data => { 
      console.log('Festivals reçus : ', data);
      this.festivals.set(data);
      });
    }

   

    submit() {


      if (this.form.invalid) return;

      console.log('Formulaire valide, données : ', String(this.currentFestival()?.id));
     

      const formData = new FormData();

        formData.append('affectation[user_id]', this.form.value.user_id);
        formData.append('affectation[task_id]', this.route.snapshot.paramMap.get('id')!);
        formData.append('affectation[festival_id]', String(this.currentFestival()?.id));
        formData.append('affectation[expected_start]', this.form.value.expected_start);
        formData.append('affectation[expected_end]', this.form.value.expected_end);
        formData.append('affectation[responsability]', this.form.value.responsability);


      if (this.isEditMode) {

         const idParam = this.route.snapshot.paramMap.get('affectationId');

    
          const id = idParam ? Number(idParam) : null;

        this.affectationService.updateAffectation(id, formData).subscribe({
          next: data => {
            console.log('Affectation mise à jour : ', data);
          },
          error: err => {
            this.showErrorsAsSnackBar(err);
          }
        });
      } else {
        this.affectationService.createAffectation(formData).subscribe({
          next: data => {
            console.log('Affectation créée : ', data);
          },
          error: err => {
            this.showErrorsAsSnackBar(err);
          }
        });
      }
     this.router.navigate(['/task', this.route.snapshot.paramMap.get('id'), 'affectations']);

    }
    
    private formatForDatetimeLocal(dateString: string): string {
      const date = new Date(dateString);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

  // expected_end must be after expected_start
  endAfterStartValidator(group: AbstractControl): ValidationErrors | null {

    const start = group.get('expected_start')?.value;
    const end = group.get('expected_end')?.value;

    if (!start || !end) return null;

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (endDate <= startDate) {
      return { endBeforeStart: true };
    }

    return null;
  }
  filteredUsers() {

    const term = this.searchTerm().toLowerCase();

    return this.users().filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.ability?.toLowerCase().includes(term)
    );


  }

   private showErrorsAsSnackBar(err: any): void {
    const errors = this.errorHandler.parseRailsErrors(err);
  
  }
}
