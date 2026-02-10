import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";

import { AuthService } from '../../auth.service';
import { LoginCredentials } from '../../models/loginCredential';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [RouterLink,MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatIconModule, MatCardModule]
})
export class Login {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  error = signal<string | null>(null);
  hidePassword = true;
  
  constructor(private authService: AuthService) {}
  
  submit(email: string, password: string) {
    const credentials: LoginCredentials = { email, password };

    console.log('Attempting login with credentials:', credentials);
    
    this.auth.login(credentials).subscribe(success => {
      if (success) {
          console.log('Login successful');
          this.router.navigate(['/']);
      } else {
          console.log('Login failed');
          this.error.set('Identifiants invalides');
      }
    });
  }
}