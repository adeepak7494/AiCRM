import { Injectable, inject, signal } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  authState,
  User
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable, EMPTY, from } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class FirebaseAuthService {
  private auth : any = inject(Auth);
  private router = inject(Router);

  // Use signals for reactive state
  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  // Also provide RxJS observables for compatibility
  authState$ = authState(this.auth);

  constructor() {
    // Initialize authentication state
    this.authState$.pipe(
      tap(user => {
        this.currentUser.set(user);
        this.isAuthenticated.set(!!user);
      })
    ).subscribe();
  }

  register(email: string, password: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      catchError(error => {
        console.error('Registration failed:', error);
        throw error;
      })
    );
  }

  login(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(() => this.router.navigate(['/dashboard'])),
      catchError(error => {
        console.error('Login failed:', error);
        throw error;
      })
    );
  }

  loginWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      tap(() => this.router.navigate(['/dashboard'])),
      catchError(error => {
        console.error('Google login failed:', error);
        throw error;
      })
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => this.router.navigate(['/auth/login'])),
      catchError(error => {
        console.error('Logout failed:', error);
        return EMPTY;
      })
    );
  }

  async getIdToken(): Promise<string | null> {
    return this.auth.currentUser?.getIdToken() || Promise.resolve(null);
  }
}
