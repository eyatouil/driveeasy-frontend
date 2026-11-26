import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehiculeService } from '../../services/vehicule.service';
import { Vehicule, Carburant, StatutVehicule } from '../../models/vehicule.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-vehicules',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './vehicules.component.html',
  styleUrls: ['./vehicules.component.css']
})
export class VehiculesComponent implements OnInit {
  private vehiculeService = inject(VehiculeService);

  vehicules: Vehicule[] = [];
  loading = true;
  error: string | null = null;
  feedbackMessage: string | null = null;
  feedbackType: 'success' | 'error' = 'success';

  // Filters
  searchQuery = '';
  selectedCarburant: Carburant | '' = '';
  selectedStatut: StatutVehicule | '' = '';
  maxPrice: number | null = null;

  // Tri et pagination (côté client : l'API renvoie la liste filtrée complète)
  sortKey: 'prixJournalier' | 'marque' | 'annee' | 'kilometrage' = 'marque';
  sortDir: 'asc' | 'desc' = 'asc';
  page = 1;
  pageSize = 6;

  ngOnInit(): void {
    this.fetchVehicules();
  }

  fetchVehicules(): void {
    this.loading = true;
    this.error = null;

    this.vehiculeService.getAllVehicules({
      query: this.searchQuery || undefined,
      carburant: (this.selectedCarburant as Carburant) || undefined,
      statut: (this.selectedStatut as StatutVehicule) || undefined,
      prixMax: this.maxPrice || undefined
    }).subscribe({
      next: (data) => {
        this.vehicules = data;
        this.page = 1;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des véhicules';
        this.loading = false;
      }
    });
  }

  get sortedVehicules(): Vehicule[] {
    const k = this.sortKey;
    const dir = this.sortDir === 'asc' ? 1 : -1;
    return [...this.vehicules].sort((a, b) => {
      const x = a[k] as any, y = b[k] as any;
      return (typeof x === 'string' ? x.localeCompare(y) : Number(x) - Number(y)) * dir;
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.vehicules.length / this.pageSize));
  }

  get pagedVehicules(): Vehicule[] {
    const start = (this.page - 1) * this.pageSize;
    return this.sortedVehicules.slice(start, start + this.pageSize);
  }

  goTo(p: number): void {
    this.page = Math.min(Math.max(1, p), this.totalPages);
  }

  toggleSortDir(): void {
    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    this.page = 1;
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCarburant = '';
    this.selectedStatut = '';
    this.maxPrice = null;
    this.fetchVehicules();
  }

  deleteVehicule(v: Vehicule): void {
    if (v.statut === 'LOUE') {
      alert('Action impossible : ce véhicule est actuellement LOUÉ et ne peut être supprimé.');
      return;
    }

    if (confirm(`Confirmez-vous la suppression du véhicule ${v.marque} ${v.modele} (${v.immatriculation}) ?`)) {
      this.vehiculeService.deleteVehicule(v.id).subscribe({
        next: () => {
          this.feedbackType = 'success';
          this.feedbackMessage = `Véhicule ${v.marque} ${v.modele} supprimé avec succès.`;
          this.fetchVehicules();
          setTimeout(() => this.feedbackMessage = null, 4000);
        },
        error: (err) => {
          this.feedbackType = 'error';
          this.feedbackMessage = err.error?.message || 'Erreur lors de la suppression du véhicule';
          setTimeout(() => this.feedbackMessage = null, 5000);
        }
      });
    }
  }
}
