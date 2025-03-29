// src/app/features/auth/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FirebaseAuthService } from '../../../core/auth/firebase-auth.service';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>AI CRM Login</mat-card-title>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            @if (errorMessage()) {
              <div class="error-message">
                {{errorMessage()}}
              </div>
            }

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Email</mat-label>
              <input matInput formControlName="email" type="email" required>
              <mat-icon matSuffix>email</mat-icon>
              @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="form-field">
              <mat-label>Password</mat-label>
              <input
                matInput
                formControlName="password"
                [type]="hidePassword() ? 'password' : 'text'"
                required
              >
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="togglePasswordVisibility()"
              >
                <mat-icon>{{hidePassword() ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
              @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
            </mat-form-field>

            <div class="form-actions">
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="loginForm.invalid || isLoading()"
                class="login-button"
              >
                @if (isLoading()) {
                  <mat-spinner diameter="24"></mat-spinner>
                } @else {
                  Login
                }
              </button>

              <a mat-button routerLink="/auth/forgot-password" class="forgot-password">
                Forgot Password?
              </a>
            </div>
          </form>

          <mat-divider class="divider"></mat-divider>

          <div class="social-login">
            <button
              mat-raised-button
              (click)="loginWithGoogle()"
              [disabled]="isLoading()"
              class="google-button"
            >
              <mat-icon>login</mat-icon>
              Login with Google
            </button>

            <div class="register-link">
              Don't have an account?
              <a routerLink="/auth/register">Register</a>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f5f5f5;
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: 20px;
    }

    .form-field {
      width: 100%;
      margin-bottom: 16px;
    }

    .form-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 24px;
    }

    .login-button {
      width: 100%;
      height: 42px;
    }

    .forgot-password {
      margin-top: 8px;
      align-self: flex-end;
    }

    .divider {
      margin: 24px 0 16px;
    }

    .social-login {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .google-button {
      width: 100%;
      margin-bottom: 16px;
    }

    .register-link {
      margin-top: 16px;
      text-align: center;
    }

    .error-message {
      background-color: #ffebee;
      color: #c62828;
      padding: 8px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(FirebaseAuthService);
  private router = inject(Router);

  // Use signals for reactive state
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  hidePassword = signal<boolean>(true);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(email, password).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.getErrorMessage(error.code));
      }
    });
  }

  loginWithGoogle(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorMessage.set(this.getErrorMessage(error.code));
      }
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(value => !value);
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password';
      case 'auth/too-many-requests':
        return 'Too many unsuccessful login attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled';
      default:
        return 'An error occurred during login. Please try again.';
    }
  }
}
