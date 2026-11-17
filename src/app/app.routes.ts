import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VehiculesComponent } from './pages/vehicules/vehicules.component';
import { VehiculeFormComponent } from './pages/vehicule-form/vehicule-form.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { ClientDetailComponent } from './pages/client-detail/client-detail.component';
import { ClientFormComponent } from './pages/client-form/client-form.component';
import { LocationWizardComponent } from './pages/location-wizard/location-wizard.component';
import { LocationsComponent } from './pages/locations/locations.component';
import { LocationRetourComponent } from './pages/location-retour/location-retour.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'vehicules', component: VehiculesComponent },
  { path: 'vehicules/new', component: VehiculeFormComponent },
  { path: 'vehicules/:id/edit', component: VehiculeFormComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'clients/new', component: ClientFormComponent },
  { path: 'clients/:id', component: ClientDetailComponent },
  { path: 'clients/:id/edit', component: ClientFormComponent },
  { path: 'locations', component: LocationsComponent },
  { path: 'locations/new', component: LocationWizardComponent },
  { path: 'locations/:id/retour', component: LocationRetourComponent },
  { path: '**', redirectTo: 'dashboard' }
];
