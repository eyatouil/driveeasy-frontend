import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LocationsComponent } from './locations.component';
import { LocationService } from '../../services/location.service';

describe('LocationsComponent (pagination)', () => {
  const page = (p: number) => ({ items: [], total: 25, totalPages: 3, page: p, size: 10 });
  let getLocationsPage: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    getLocationsPage = vi.fn().mockImplementation((p: number) => of(page(p)));
    TestBed.configureTestingModule({
      imports: [LocationsComponent],
      providers: [provideRouter([]), { provide: LocationService, useValue: { getLocationsPage } }]
    });
  });

  it('charge la page 0 au démarrage et mémorise le total', () => {
    const c = TestBed.createComponent(LocationsComponent).componentInstance;
    c.ngOnInit();
    expect(getLocationsPage).toHaveBeenCalledWith(0, 10, expect.any(Object));
    expect(c.totalElements).toBe(25);
    expect(c.totalPages).toBe(3);
  });

  it('goToPage avance, refuse les pages hors limites', () => {
    const c = TestBed.createComponent(LocationsComponent).componentInstance;
    c.ngOnInit();
    c.goToPage(1);
    expect(c.page).toBe(1);
    c.goToPage(3);
    c.goToPage(-1);
    expect(c.page).toBe(1);
  });

  it('un changement de filtre réinitialise la page à 0', () => {
    const c = TestBed.createComponent(LocationsComponent).componentInstance;
    c.ngOnInit();
    c.goToPage(2);
    c.filterByStatut('EN_COURS');
    expect(c.page).toBe(0);
    expect(getLocationsPage).toHaveBeenLastCalledWith(0, 10, expect.objectContaining({ statut: 'EN_COURS' }));
  });

  it('affiche un message si le serveur est indisponible', () => {
    getLocationsPage.mockReturnValue(throwError(() => new Error('down')));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const c = TestBed.createComponent(LocationsComponent).componentInstance;
    c.ngOnInit();
    expect(c.error).toContain('Erreur');
    expect(c.loading).toBe(false);
  });
});
