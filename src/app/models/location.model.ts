import { Client } from './client.model';
import { Vehicule } from './vehicule.model';

export type StatutLocation = 'RESERVEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

export interface Location {
  id: number;
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
  dateRetourEffectif?: string;
  kmDepart: number;
  kmRetour?: number;
  prixJournalierApplique: number;
  montantTotal: number;
  penalite: number;
  statut: StatutLocation;
  dateCreation: string;
}

export interface LocationEnrichie extends Location {
  dureeJours: number;
  remisePourcentage: number;
  remiseMontant: number;
  client?: Client;
  vehicule?: Vehicule;
}

export interface LocationCreatePayload {
  clientId: number;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
}

export interface SimulationPayload {
  clientId?: number;
  categorieClient?: string;
  vehiculeId: number;
  dateDebut: string;
  dateFinPrevue: string;
}

export interface SimulationResponse {
  vehiculeId: number;
  vehiculeMarqueModele: string;
  prixJournalier: number;
  nombreJours: number;
  montantBrut: number;
  categorieClient: string;
  tauxRemise: number;
  montantRemise: number;
  montantTotalEstime: number;
}

export interface Statistiques {
  chiffreAffairesTotal: number;
  chiffreAffairesMoisCourant: number;
  tauxOccupation: number;
  totalLocations: number;
  locationsEnCours: number;
  locationsTerminees: number;
  locationsReservees: number;
  locationsAnnulees: number;
  topVehicules: {
    vehiculeId: number;
    immatriculation: string;
    marqueModele: string;
    nombreLocations: number;
  }[];
}
