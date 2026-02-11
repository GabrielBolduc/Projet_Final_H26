import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  imports: [
    CommonModule,
    RouterLink,
    MatCheckboxModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    ReactiveFormsModule, 
    MatIconModule, 
    MatCardModule,
    TranslateModule
  ]
})
export class Signup {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = false;
  errorMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;

  signupForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', [Validators.required]],
    is_staff: [false],
    specialty: ['']
  }, { validators: this.passwordMatchValidator });

  get is_staff() {
    return this.signupForm.get('is_staff')?.value || false;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');
    
    if (!password || !confirmPassword) return null;
    
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  submit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.signupForm.value;
      const credentials = {
        email: formValue.email!,
        password: formValue.password!,
        password_confirmation: formValue.password_confirmation!,
        name: formValue.name!,
        phone_number: formValue.phone_number!,
        role: (formValue.is_staff ? 'STAFF' : 'CLIENT') as 'CLIENT'
      };

      this.authService.signup(credentials).subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            this.router.navigate(['/home']);
          } else {
            this.errorMessage = 'Erreur lors de l\'inscription';
          }
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Erreur serveur';
        }
      });
    }
  }
}