import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { StorageService } from '../services/storage.service';

/**
 * Intercepteur fonctionnel (compatible Standalone Components).
 * Enregistré dans main.ts via provideHttpClient(withInterceptors([authInterceptor])).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);

  return from(storage.get('accessToken')).pipe(
    switchMap((token) => {
      const requeteAvecToken = token
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
        : req;
      return next(requeteAvecToken);
    })
  );
};
