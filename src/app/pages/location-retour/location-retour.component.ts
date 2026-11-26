import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocationService } from '../../services/location.service';
import { LocationEnrichie } from '../../models/location.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-location-retour',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './location-retour.component.html',
  styleUrls: ['./location-retour.component.css']
})
export class LocationRetourComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private locationService = inject(LocationService);

  locationId!: number;
  locationEnrichie: LocationEnrichie | null = null;
  loading = true;
  submitting = false;
  error: string | null = null;

  // Form fields
  dateRetourEffectif: string = '';
  kmRetour: number | null = null;

  // Real-time calculations
  joursRetard = 0;
  penaliteRetard = 0;
  montantTotalFinal = 0;
  distanceParcourue = 0;

  // Return completed state
  retourConfirme = false;

  ngOnInit(): void {
    this.locationId = Number(this.route.snapshot.paramMap.get('id'));
    const today = new Date().toISOString().split('T')[0];
    this.dateRetourEffectif = today;

    this.loadLocation();
  }

  loadLocation(): void {
    this.loading = true;
    this.locationService.getLocationEnrichie(this.locationId).subscribe({
      next: (enr) => {
        this.locationEnrichie = enr;
        this.kmRetour = enr.kmDepart + 150; // suggestion raisonnable
        this.recalculer();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger les données de la location';
        this.loading = false;
      }
    });
  }

  recalculer(): void {
    if (!this.locationEnrichie) return;

    // Calcul distance
    if (this.kmRetour && this.kmRetour >= this.locationEnrichie.kmDepart) {
      this.distanceParcourue = this.kmRetour - this.locationEnrichie.kmDepart;
    } else {
      this.distanceParcourue = 0;
    }

    // Calcul retard
    if (this.dateRetourEffectif && this.locationEnrichie.dateFinPrevue) {
      const retourDate = new Date(this.dateRetourEffectif);
      const finPrevueDate = new Date(this.locationEnrichie.dateFinPrevue);

      if (retourDate > finPrevueDate) {
        const diffTime = retourDate.getTime() - finPrevueDate.getTime();
        this.joursRetard = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const facteur = 1.5;
        this.penaliteRetard = Math.round(this.joursRetard * facteur * this.locationEnrichie.prixJournalierApplique * 100) / 100;
      } else {
        this.joursRetard = 0;
        this.penaliteRetard = 0;
      }
    }

    this.montantTotalFinal = Math.round((this.locationEnrichie.montantTotal + this.penaliteRetard) * 100) / 100;
  }

  validerRetour(): void {
    if (!this.locationEnrichie) return;

    if (!this.kmRetour || this.kmRetour < this.locationEnrichie.kmDepart) {
      this.error = `Le kilométrage au retour doit être supérieur ou égal au kilométrage initial (${this.locationEnrichie.kmDepart} km).`;
      return;
    }

    this.submitting = true;
    this.error = null;

    this.locationService.retournerVehicule(this.locationId, this.kmRetour, this.dateRetourEffectif).subscribe({
      next: (updatedLoc) => {
        this.locationEnrichie!.statut = 'TERMINEE';
        this.locationEnrichie!.penalite = this.penaliteRetard;
        this.locationEnrichie!.montantTotal = this.montantTotalFinal;
        this.locationEnrichie!.kmRetour = this.kmRetour!;
        this.locationEnrichie!.dateRetourEffectif = this.dateRetourEffectif;
        this.submitting = false;
        this.retourConfirme = true;
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Erreur lors de la validation du retour du véhicule';
      }
    });
  }

  imprimerFacture(): void {
    window.print();
  }
}
