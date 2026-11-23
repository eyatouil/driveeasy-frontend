import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client, ClientFormData, EligibiliteClient, CategorieClient } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api/clients';

  getClients(query?: string): Observable<Client[]> {
    let params = new HttpParams();
    if (query) params = params.set('query', query);
    return this.http.get<Client[]>(this.baseUrl, { params });
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.baseUrl}/${id}`);
  }

  getEligibilite(id: number): Observable<EligibiliteClient> {
    return this.http.get<EligibiliteClient>(`${this.baseUrl}/${id}/eligibilite`);
  }

  createClient(data: ClientFormData): Observable<Client> {
    return this.http.post<Client>(this.baseUrl, data);
  }

  updateClient(id: number, data: Partial<ClientFormData>): Observable<Client> {
    return this.http.put<Client>(`${this.baseUrl}/${id}`, data);
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  updateCategorie(id: number, categorie: CategorieClient): Observable<Client> {
    return this.http.patch<Client>(`${this.baseUrl}/${id}/categorie`, { categorie });
  }
}
