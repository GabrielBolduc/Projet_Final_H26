import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from "@angular/router";
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    MatIconModule, 
    MatCardModule
  ]
})
export class Login {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  error = signal<string | null>(null);
  hidePassword = true;

  onSubmit() {
    console.log('Angular is handling the submit!');
    
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.auth.login({ email: email as string, password: password as string })
        .subscribe({
          next: (success) => {
            if (success) {
              this.router.navigate(['/']);
            } else {
              this.error.set('Email ou mot de passe incorrect');
            }
          },
          error: (err) => console.error(err)
        });
    }
  }
}