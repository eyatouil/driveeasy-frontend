import { Component, ChangeDetectionStrategy, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { VehiculeService } from '../../services/vehicule.service';
import { Statistiques, Location } from '../../models/location.model';
import { Vehicule } from '../../models/vehicule.model';
import { forkJoin } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  private locationService = inject(LocationService);
  private vehiculeService = inject(VehiculeService);
  private cdr = inject(ChangeDetectorRef);

  stats: Statistiques | null = null;
  vehicules: Vehicule[] = [];
  recentLocations: Location[] = [];
  loading = true;
  error: string | null = null;

  // Derived counts
  disponiblesCount = 0;
  louesCount = 0;
  maintenanceCount = 0;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;
    this.cdr.markForCheck();

    forkJoin({
      stats: this.locationService.getStatistiques(),
      vehicules: this.vehiculeService.getAllVehicules(),
      locations: this.locationService.getLocations()
    }).subscribe({
      next: (data) => {
        this.stats = data.stats;
        this.vehicules = data.vehicules;
        this.recentLocations = data.locations.slice(0, 5);

        this.disponiblesCount = this.vehicules.filter(v => v.statut === 'DISPONIBLE').length;
        this.louesCount = this.vehicules.filter(v => v.statut === 'LOUE').length;
        this.maintenanceCount = this.vehicules.filter(v => v.statut === 'MAINTENANCE').length;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Erreur chargement dashboard', err);
        this.error = 'Impossible de contacter la passerelle API Gateway (port 8080). Vérifiez que les microservices sont démarrés.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
