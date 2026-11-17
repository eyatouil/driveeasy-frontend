import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vehicule, VehiculeFormData, StatutVehicule, Carburant } from '../models/vehicule.model';

@Injectable({
  providedIn: 'root'
})
export class VehiculeService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/vehicules';

  getAllVehicules(filters?: {
    query?: string;
    carburant?: Carburant;
    statut?: StatutVehicule;
    prixMax?: number;
  }): Observable<Vehicule[]> {
    let params = new HttpParams();
    if (filters?.query) params = params.set('query', filters.query);
    if (filters?.carburant) params = params.set('carburant', filters.carburant);
    if (filters?.statut) params = params.set('statut', filters.statut);
    if (filters?.prixMax) params = params.set('prixMax', filters.prixMax.toString());

    return this.http.get<Vehicule[]>(this.baseUrl, { params });
  }

  getDisponibles(dateDebut?: string, dateFin?: string): Observable<Vehicule[]> {
    let params = new HttpParams();
    if (dateDebut) params = params.set('dateDebut', dateDebut);
    if (dateFin) params = params.set('dateFin', dateFin);
    return this.http.get<Vehicule[]>(`${this.baseUrl}/disponibles`, { params });
  }

  getVehiculeById(id: number): Observable<Vehicule> {
    return this.http.get<Vehicule>(`${this.baseUrl}/${id}`);
  }

  createVehicule(data: VehiculeFormData): Observable<Vehicule> {
    return this.http.post<Vehicule>(this.baseUrl, data);
  }

  updateVehicule(id: number, data: Partial<VehiculeFormData>): Observable<Vehicule> {
    return this.http.put<Vehicule>(`${this.baseUrl}/${id}`, data);
  }

  deleteVehicule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateStatut(id: number, statut: StatutVehicule, kilometrage?: number): Observable<Vehicule> {
    const payload: { statut: StatutVehicule; kilometrage?: number } = { statut };
    if (kilometrage !== undefined) payload.kilometrage = kilometrage;
    return this.http.patch<Vehicule>(`${this.baseUrl}/${id}/statut`, payload);
  }
}
