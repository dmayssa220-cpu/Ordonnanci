import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { environment } from '../../environments/environment';

/**
 * Intercepteur fonctionnel (compatible Standalone Components).
 * - Ajoute automatiquement le token JWT sur chaque requête.
 * - Si une requête échoue en 401 (access token expiré, durée de vie 15 min),
 *   tente un rafraîchissement silencieux via /auth/refresh et rejoue la
 *   requête originale. Si le rafraîchissement échoue aussi (refresh token
 *   expiré après 7 jours, ou absent), déconnecte et redirige vers /connexion
 *   au lieu de laisser l'app bloquée indéfiniment.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  const http = inject(HttpClient);
  const router = inject(Router);

  const cloneAvecToken = (token: string | null) =>
    token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  const estRouteAuth =
    req.url.includes('/auth/login') || req.url.includes('/auth/register') || req.url.includes('/auth/refresh');

  const deconnecterEtRediriger = (erreurOriginale: unknown) =>
    from(storage.clear()).pipe(
      switchMap(() => {
        router.navigateByUrl('/connexion');
        return throwError(() => erreurOriginale);
      })
    );

  return from(storage.get('accessToken')).pipe(
    switchMap((token) => next(cloneAvecToken(token))),
    catchError((erreur: HttpErrorResponse) => {
      if (erreur.status !== 401 || estRouteAuth) {
        return throwError(() => erreur);
      }

      return from(storage.get('refreshToken')).pipe(
        switchMap((refreshToken) => {
          if (!refreshToken) {
            return deconnecterEtRediriger(erreur);
          }

          return http.post<{ accessToken: string }>(`${environment.apiUrl}/auth/refresh`, { refreshToken }).pipe(
            switchMap((reponse) =>
              from(storage.set('accessToken', reponse.accessToken)).pipe(
                switchMap(() => next(cloneAvecToken(reponse.accessToken)))
              )
            ),
            catchError(() => deconnecterEtRediriger(erreur))
          );
        })
      );
    })
  );
};
