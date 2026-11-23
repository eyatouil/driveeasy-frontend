import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClientService } from '../../services/client.service';
import { LocationService } from '../../services/location.service';
import { Client, EligibiliteClient } from '../../models/client.model';
import { Location } from '../../models/location.model';
import { forkJoin } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-detail.component.html',
  styleUrls: ['./client-detail.component.css']
})
export class ClientDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private clientService = inject(ClientService);
  private locationService = inject(LocationService);

  client: Client | null = null;
  eligibilite: EligibiliteClient | null = null;
  locations: Location[] = [];
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadClientData(id);
    }
  }

  loadClientData(id: number): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      client: this.clientService.getClientById(id),
      eligibilite: this.clientService.getEligibilite(id),
      locations: this.locationService.getLocations({ clientId: id })
    }).subscribe({
      next: (res) => {
        this.client = res.client;
        this.eligibilite = res.eligibilite;
        this.locations = res.locations;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Impossible de charger la fiche client';
        this.loading = false;
      }
    });
  }
}
