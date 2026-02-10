import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { AuthService } from '../../auth.service';
import { LoginCredentials } from '../../models/loginCredential';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  imports: [
    RouterLink,
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule, 
    ReactiveFormsModule, 
    MatIconModule, 
    MatCardModule,
    TranslateModule
  ]

})

export class Login {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  constructor(private translate: TranslateService) {}

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  error = signal<string | null>(null);
  hidePassword = true;

  submit() {
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