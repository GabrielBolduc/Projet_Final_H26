import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [CommonModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, MatCardModule, MatIconModule, TranslateModule]
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');
  hidePassword = true;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  submit() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      
      this.authService.login(this.loginForm.value as any).subscribe({
        next: (success) => {
          this.isLoading.set(false);
          if (success) {
            this.router.navigate(['/']);
          } else {
            this.errorMessage.set('Identifiants invalides');
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMessage.set('Erreur serveur');
        }
      });
    }
  }
}