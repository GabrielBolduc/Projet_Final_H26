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

import { AuthService } from '../../auth.service';
import { SignupCredentials } from '../../models/signupCredentials';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  imports: [MatCheckboxModule,MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatIconModule, MatCardModule, RouterLink]
})
export class Signup {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  error = signal<string | null>(null);
  hidePassword = true;
  hideConfirmPassword = true;
  is_staff = false;

 

  constructor(private authService: AuthService) {}

  onSubmit(name: string, email: string, password: string, phone: string, is_staff: boolean) {
    const credentials: SignupCredentials = { email, password, name, phone, is_staff };
    
    this.auth.signup(credentials).subscribe(success => {
      if (success) {
          this.router.navigate(['/']);
      } else {
          this.error.set('Impossible de créer le compte');
      }
    });
  }
}
