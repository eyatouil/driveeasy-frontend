import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { VehiculeService } from '../../services/vehicule.service';
import { LocationService } from '../../services/location.service';
import { Client, EligibiliteClient } from '../../models/client.model';
import { Vehicule } from '../../models/vehicule.model';
import { SimulationResponse } from '../../models/location.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-location-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './location-wizard.component.html',
  styleUrls: ['./location-wizard.component.css']
})
export class LocationWizardComponent implements OnInit {
  private clientService = inject(ClientService);
  private vehiculeService = inject(VehiculeService);
  private locationService = inject(LocationService);
  private router = inject(Router);

  currentStep = 1;

  // Step 1: Client
  clients: Client[] = [];
  clientSearch = '';
  selectedClientId: number | null = null;
  selectedClient: Client | null = null;
  eligibilite: EligibiliteClient | null = null;
  checkingEligibility = false;

  // Step 2: Dates
  dateDebut: string = '';
  dateFinPrevue: string = '';
  dureeJours: number = 1;

  // Step 3: Véhicule
  disponibles: Vehicule[] = [];
  selectedVehiculeId: number | null = null;
  selectedVehicule: Vehicule | null = null;
  loadingVehicules = false;

  // Step 4: Simulation
  simulation: SimulationResponse | null = null;
  loadingSimulation = false;

  // General state
  submitting = false;
  error: string | null = null;

  get filteredClients(): Client[] {
    const q = this.clientSearch.trim().toLowerCase();
    if (!q) return this.clients;
    return this.clients.filter(c =>
      `${c.prenom} ${c.nom} ${c.cin} ${c.email}`.toLowerCase().includes(q));
  }

  ngOnInit(): void {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 3);

    this.dateDebut = today.toISOString().split('T')[0];
    this.dateFinPrevue = tomorrow.toISOString().split('T')[0];
    this.calcDuration();

    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (list) => {
        this.clients = list;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de la liste des clients';
      }
    });
  }

  onClientSelect(): void {
    if (!this.selectedClientId) {
      this.selectedClient = null;
      this.eligibilite = null;
      return;
    }

    this.selectedClient = this.clients.find(c => c.id === Number(this.selectedClientId)) || null;
    this.checkingEligibility = true;
    this.eligibilite = null;
    this.error = null;

    this.clientService.getEligibilite(Number(this.selectedClientId)).subscribe({
      next: (el) => {
        this.eligibilite = el;
        this.checkingEligibility = false;
      },
      error: (err) => {
        this.checkingEligibility = false;
        this.error = 'Erreur lors de la vérification de l\'éligibilité';
      }
    });
  }

  calcDuration(): void {
    if (this.dateDebut && this.dateFinPrevue) {
      const start = new Date(this.dateDebut);
      const end = new Date(this.dateFinPrevue);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.dureeJours = diffDays > 0 ? diffDays : 1;
    }
  }

  loadAvailableVehicules(): void {
    this.loadingVehicules = true;
    this.vehiculeService.getDisponibles(this.dateDebut, this.dateFinPrevue).subscribe({
      next: (list) => {
        this.disponibles = list;
        this.loadingVehicules = false;
      },
      error: (err) => {
        this.loadingVehicules = false;
        this.error = 'Erreur lors de la recherche des véhicules disponibles';
      }
    });
  }

  selectVehicule(v: Vehicule): void {
    this.selectedVehiculeId = v.id;
    this.selectedVehicule = v;
  }

  runSimulation(): void {
    if (!this.selectedVehiculeId || !this.selectedClientId) return;

    this.loadingSimulation = true;
    this.locationService.simulerPrix({
      clientId: this.selectedClientId,
      vehiculeId: this.selectedVehiculeId,
      dateDebut: this.dateDebut,
      dateFinPrevue: this.dateFinPrevue
    }).subscribe({
      next: (sim) => {
        this.simulation = sim;
        this.loadingSimulation = false;
      },
      error: (err) => {
        this.loadingSimulation = false;
        this.error = 'Erreur lors du calcul de la simulation de prix';
      }
    });
  }

  goToStep(step: number): void {
    this.error = null;

    if (step === 2) {
      if (!this.selectedClient) {
        this.error = 'Veuillez sélectionner un client.';
        return;
      }
      if (!this.eligibilite?.eligible) {
        this.error = 'Ce client n\'est pas éligible pour louer (vérifiez l\'âge ou la validité du permis).';
        return;
      }
    }

    if (step === 3) {
      if (!this.dateDebut || !this.dateFinPrevue || new Date(this.dateDebut) > new Date(this.dateFinPrevue)) {
        this.error = 'Période invalide : la date de fin doit être postérieure à la date de début.';
        return;
      }
      this.loadAvailableVehicules();
    }

    if (step === 4) {
      if (!this.selectedVehicule) {
        this.error = 'Veuillez sélectionner un véhicule disponible.';
        return;
      }
      this.runSimulation();
    }

    this.currentStep = step;
  }

  confirmBooking(): void {
    if (!this.selectedClientId || !this.selectedVehiculeId) return;

    this.submitting = true;
    this.error = null;

    this.locationService.createReservation({
      clientId: this.selectedClientId,
      vehiculeId: this.selectedVehiculeId,
      dateDebut: this.dateDebut,
      dateFinPrevue: this.dateFinPrevue
    }).subscribe({
      next: (loc) => {
        this.router.navigate(['/locations']);
      },
      error: (err) => {
        this.submitting = false;
        this.error = err.error?.message || 'Erreur lors de la confirmation de la réservation';
      }
    });
  }
}
