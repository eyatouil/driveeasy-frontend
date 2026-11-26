import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { LocationService } from './location.service';

describe('LocationService', () => {
  let service: LocationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(LocationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('transmet page, size et filtres, et lit les en-têtes de pagination', () => {
    let result: any;
    service.getLocationsPage(2, 5, { statut: 'EN_COURS', dateDebut: '2026-11-01' }).subscribe(r => (result = r));

    const req = http.expectOne(r => r.url === 'http://localhost:8080/api/locations');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('5');
    expect(req.request.params.get('statut')).toBe('EN_COURS');
    expect(req.request.params.get('dateDebut')).toBe('2026-11-01');

    req.flush([{ id: 1 }, { id: 2 }], { headers: { 'X-Total-Count': '12', 'X-Total-Pages': '3' } });

    expect(result.items.length).toBe(2);
    expect(result.total).toBe(12);
    expect(result.totalPages).toBe(3);
    expect(result.page).toBe(2);
  });

  it('retombe sur des valeurs par défaut sans en-têtes', () => {
    let result: any;
    service.getLocationsPage(0, 10).subscribe(r => (result = r));
    http.expectOne(r => r.url.endsWith('/locations')).flush([{ id: 1 }]);
    expect(result.total).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it('simulation : POST sur /locations/simulation', () => {
    service.simulerPrix({ vehiculeId: 1, dateDebut: '2026-12-01', dateFinPrevue: '2026-12-05' } as any).subscribe();
    const req = http.expectOne('http://localhost:8080/api/locations/simulation');
    expect(req.request.method).toBe('POST');
    req.flush({});
  });
});
