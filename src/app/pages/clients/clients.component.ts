import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { Client } from '../../models/client.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css']
})
export class ClientsComponent implements OnInit {
  private clientService = inject(ClientService);

  clients: Client[] = [];
  loading = true;
  error: string | null = null;
  searchQuery = '';

  // Pagination et tri (côté client)
  page = 1;
  pageSize = 6;
  sortKey: 'nom' | 'dateInscription' | 'categorieClient' = 'nom';
  sortDir: 'asc' | 'desc' = 'asc';

  feedbackMessage: string | null = null;
  feedbackType: 'success' | 'error' = 'success';

  ngOnInit(): void {
    this.fetchClients();
  }

  fetchClients(): void {
    this.loading = true;
    this.error = null;

    this.clientService.getClients(this.searchQuery).subscribe({
      next: (data) => {
        this.clients = data;
        this.page = 1;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des clients';
        this.loading = false;
      }
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.clients.length / this.pageSize));
  }

  get pagedClients(): Client[] {
    const k = this.sortKey;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    const sorted = [...this.clients].sort((a, b) => String(a[k] ?? '').localeCompare(String(b[k] ?? '')) * dir);
    const start = (this.page - 1) * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  }

  goTo(p: number): void {
    this.page = Math.min(Math.max(1, p), this.totalPages);
  }

  sortBy(k: 'nom' | 'dateInscription' | 'categorieClient'): void {
    if (this.sortKey === k) { this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'; }
    else { this.sortKey = k; this.sortDir = 'asc'; }
    this.page = 1;
  }

  deleteClient(c: Client): void {
    if (confirm(`Confirmez-vous la suppression du client ${c.prenom} ${c.nom} (CIN: ${c.cin}) ?`)) {
      this.clientService.deleteClient(c.id).subscribe({
        next: () => {
          this.feedbackType = 'success';
          this.feedbackMessage = `Client ${c.prenom} ${c.nom} supprimé avec succès.`;
          this.fetchClients();
          setTimeout(() => this.feedbackMessage = null, 4000);
        },
        error: (err) => {
          this.feedbackType = 'error';
          this.feedbackMessage = err.error?.message || 'Erreur lors de la suppression du client';
          setTimeout(() => this.feedbackMessage = null, 5000);
        }
      });
    }
  }
}
