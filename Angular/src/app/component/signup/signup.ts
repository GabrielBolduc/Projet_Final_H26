import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../auth.service';
import { SignupCredentials } from '../../models/signupCredential';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  imports: [
    MatCheckboxModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    ReactiveFormsModule, 
    MatIconModule, 
    MatCardModule, 
    RouterLink,
    TranslateModule
  ]
})
export class Signup {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  error = signal<string | null>(null);
  hidePassword = true;
  hideConfirmPassword = true;
  is_staff = false;

  constructor(private authService: AuthService, private translate: TranslateService) {}

  signupForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    password_confirmation: ['', [Validators.required]],
    phone_number: ['', [Validators.required]],
    role: ['']
  });

  submit() {
      console.log('Angular is handling the signup!');
      
      if (this.signupForm.valid) {
        // 1. Extract values. Cast to string to ensure types.
        const val = this.signupForm.value;
        const credentials = {
          email: val.email as string,
          name: val.name as string,
          password: val.password as string,
          password_confirmation: val.password_confirmation as string,
          phone_number: val.phone_number as string,
          role: val.role as 'CLIENT'
        };

        // 2. Call the service
        this.auth.signup(credentials).subscribe({
          next: (success) => {
            if (success) {
              console.log('Signup successful!');
              this.router.navigate(['/']); // Redirect to home on success
            } else {
              // Handle specific Rails validation errors if needed, or a generic message
              this.error.set('Erreur lors de l\'inscription. Vérifiez les champs.');
            }
          },
          error: (err) => {
            console.error(err);
            this.error.set('Une erreur technique est survenue.');
          }
        });
      }
    }
  }
