// src/app/core/http/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';
import { FirebaseAuthService } from '../auth/firebase-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(FirebaseAuthService);

  // Skip authentication for public endpoints
  if (req.url.includes('/auth/') || req.url.includes('/public/')) {
    return next(req);
  }

  return from(authService.getIdToken()).pipe(
    switchMap(token => {
      if (token) {
        const clonedReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next(clonedReq);
      }
      return next(req);
    })
  );
};
