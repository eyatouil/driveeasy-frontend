import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Location,
  LocationEnrichie,
  LocationCreatePayload,
  SimulationPayload,
  SimulationResponse,
  Statistiques,
  StatutLocation
} from '../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/locations';

  getLocations(filters?: {
    statut?: StatutLocation;
    clientId?: number;
    vehiculeId?: number;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<Location[]> {
    let params = new HttpParams();
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.clientId) params = params.set('clientId', filters.clientId.toString());
    if (filters?.vehiculeId) params = params.set('vehiculeId', filters.vehiculeId.toString());
    if (filters?.dateDebut) params = params.set('dateDebut', filters.dateDebut);
    if (filters?.dateFin) params = params.set('dateFin', filters.dateFin);

    return this.http.get<Location[]>(this.baseUrl, { params });
  }

  getLocationEnrichie(id: number): Observable<LocationEnrichie> {
    return this.http.get<LocationEnrichie>(`${this.baseUrl}/${id}`);
  }

  createReservation(payload: LocationCreatePayload): Observable<Location> {
    return this.http.post<Location>(this.baseUrl, payload);
  }

  simulerPrix(payload: SimulationPayload): Observable<SimulationResponse> {
    return this.http.post<SimulationResponse>(`${this.baseUrl}/simulation`, payload);
  }

  demarrerLocation(id: number, kmDepart?: number): Observable<Location> {
    const payload = kmDepart !== undefined ? { kmDepart } : {};
    return this.http.patch<Location>(`${this.baseUrl}/${id}/depart`, payload);
  }

  retournerVehicule(id: number, kmRetour: number, dateRetourEffectif?: string): Observable<Location> {
    const payload: { kmRetour: number; dateRetourEffectif?: string } = { kmRetour };
    if (dateRetourEffectif) payload.dateRetourEffectif = dateRetourEffectif;
    return this.http.patch<Location>(`${this.baseUrl}/${id}/retour`, payload);
  }

  annulerLocation(id: number): Observable<Location> {
    return this.http.patch<Location>(`${this.baseUrl}/${id}/annulation`, {});
  }

  getStatistiques(): Observable<Statistiques> {
    return this.http.get<Statistiques>(`${this.baseUrl}/statistiques`);
  }
}
