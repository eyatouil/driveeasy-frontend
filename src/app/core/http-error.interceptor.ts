import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Intercepteur d'erreurs HTTP : garantit que chaque erreur renvoyée par la gateway
 * expose un champ `error.message` lisible en français (réseau coupé, service indisponible...),
 * afin que les composants affichent un message cohérent.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      let message: string | undefined = err.error?.message;

      if (err.status === 0) {
        message = "Impossible de joindre l'API Gateway (http://localhost:8080). Vérifiez que le backend est démarré.";
      } else if (err.status === 503 && !message) {
        message = 'Service momentanément indisponible. Réessayez dans quelques instants.';
      } else if (!message) {
        message = `Erreur ${err.status} lors de l'appel ${req.method} ${req.url}`;
      }

      console.error(`[HTTP ${err.status}] ${req.method} ${req.url} -> ${message}`);
      const normalized = new HttpErrorResponse({
        error: { ...(typeof err.error === 'object' && err.error ? err.error : {}), message },
        headers: err.headers,
        status: err.status,
        statusText: err.statusText,
        url: err.url ?? undefined
      });
      return throwError(() => normalized);
    })
  );
