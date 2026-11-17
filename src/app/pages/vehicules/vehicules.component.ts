import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VehiculeService } from '../../services/vehicule.service';
import { Vehicule, Carburant, StatutVehicule } from '../../models/vehicule.model';

@Component({
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
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des véhicules';
        this.loading = false;
      }
    });
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
