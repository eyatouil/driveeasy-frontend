import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { httpErrorInterceptor } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let client: HttpClient;
  let http: HttpTestingController;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([httpErrorInterceptor])), provideHttpClientTesting()]
    });
    client = TestBed.inject(HttpClient);
    http = TestBed.inject(HttpTestingController);
  });

  function messageFor(status: number, body: any = null): string {
    let msg = '';
    client.get('/x').subscribe({ error: e => (msg = e.error.message) });
    http.expectOne('/x').flush(body, { status, statusText: 'err' });
    return msg;
  }

  it('gateway injoignable (status 0) : message explicite', () => {
    let msg = '';
    client.get('/x').subscribe({ error: e => (msg = e.error.message) });
    http.expectOne('/x').error(new ProgressEvent('error'), { status: 0 });
    expect(msg).toContain('API Gateway');
  });

  it('503 sans message : message de service indisponible', () => {
    expect(messageFor(503)).toContain('indisponible');
  });

  it('conserve le message du backend (409)', () => {
    expect(messageFor(409, { message: 'Immatriculation déjà utilisée' })).toBe('Immatriculation déjà utilisée');
  });

  it('erreur sans message : message générique avec le code', () => {
    expect(messageFor(500)).toContain('Erreur 500');
  });
});
