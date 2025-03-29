// src/app/core/auth/auth.guard.ts
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { FirebaseAuthService } from './firebase-auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(FirebaseAuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    map(user => {
      const isLoggedIn = !!user;
      if (isLoggedIn) {
        return true;
      }
      return router.createUrlTree(['/auth/login']);
    })
  );
};
