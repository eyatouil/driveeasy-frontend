import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeFrTN from '@angular/common/locales/fr-TN';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpErrorInterceptor } from './core/http-error.interceptor';
import { routes } from './app.routes';

registerLocaleData(localeFrTN);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: LOCALE_ID, useValue: 'fr-TN' },
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([httpErrorInterceptor]))
  ]
};