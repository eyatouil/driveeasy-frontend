import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../services/location.service';
import { Location, StatutLocation, LocationEnrichie } from '../../models/location.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationsComponent implements OnInit {
  private locationService = inject(LocationService);

  locations: Location[] = [];
  selectedStatut: StatutLocation | '' = '';
  filterDateDebut = '';
  filterDateFin = '';

  // Pagination (serveur) : page 0-indexée
  page = 0;
  size = 10;
  totalElements = 0;
  totalPages = 1;
  loading = true;
  error: string | null = null;
  feedbackMessage: string | null = null;
  feedbackType: 'success' | 'error' = 'success';

  // Detail Modal
  showModal = false;
  selectedLocationEnrichie: LocationEnrichie | null = null;
  loadingModal = false;

  ngOnInit(): void {
    this.fetchLocations();
  }

  fetchLocations(): void {
    this.loading = true;
    this.error = null;

    this.locationService.getLocationsPage(this.page, this.size, {
      statut: (this.selectedStatut as StatutLocation) || undefined,
      dateDebut: this.filterDateDebut || undefined,
      dateFin: this.filterDateFin || undefined
    }).subscribe({
      next: (res) => {
        this.locations = res.items;
        this.totalElements = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du chargement des locations';
        this.loading = false;
      }
    });
  }

  /** Tout changement de filtre repart de la première page. */
  applyFilters(): void {
    this.page = 0;
    this.fetchLocations();
  }

  goToPage(p: number): void {
    if (p < 0 || p >= this.totalPages) return;
    this.page = p;
    this.fetchLocations();
  }

  resetPeriode(): void {
    this.page = 0;
    this.filterDateDebut = '';
    this.filterDateFin = '';
    this.fetchLocations();
  }

  filterByStatut(statut: StatutLocation | ''): void {
    this.selectedStatut = statut;
    this.page = 0;
    this.fetchLocations();
  }

  demarrer(loc: Location): void {
    if (confirm(`Confirmez-vous le départ et la remise des clés pour la location #${loc.id} ? Le statut du véhicule passera automatiquement à LOUÉ.`)) {
      this.locationService.demarrerLocation(loc.id).subscribe({
        next: () => {
          this.feedbackType = 'success';
          this.feedbackMessage = `Location #${loc.id} démarrée avec succès. Véhicule marqué comme LOUÉ.`;
          this.fetchLocations();
          setTimeout(() => this.feedbackMessage = null, 4000);
        },
        error: (err) => {
          this.feedbackType = 'error';
          this.feedbackMessage = err.error?.message || 'Erreur lors du démarrage de la location';
          setTimeout(() => this.feedbackMessage = null, 5000);
        }
      });
    }
  }

  annuler(loc: Location): void {
    if (confirm(`Confirmez-vous l'annulation de la location #${loc.id} ?`)) {
      this.locationService.annulerLocation(loc.id).subscribe({
        next: () => {
          this.feedbackType = 'success';
          this.feedbackMessage = `Location #${loc.id} annulée.`;
          this.fetchLocations();
          setTimeout(() => this.feedbackMessage = null, 4000);
        },
        error: (err) => {
          this.feedbackType = 'error';
          this.feedbackMessage = err.error?.message || 'Erreur lors de l\'annulation';
          setTimeout(() => this.feedbackMessage = null, 5000);
        }
      });
    }
  }

  openDetails(loc: Location): void {
    this.loadingModal = true;
    this.showModal = true;
    this.locationService.getLocationEnrichie(loc.id).subscribe({
      next: (enr) => {
        this.selectedLocationEnrichie = enr;
        this.loadingModal = false;
      },
      error: (err) => {
        this.loadingModal = false;
        alert('Impossible de charger le détail enrichi');
        this.closeModal();
      }
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedLocationEnrichie = null;
  }
}
