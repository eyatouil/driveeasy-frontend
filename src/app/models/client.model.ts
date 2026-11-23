export type CategorieClient = 'STANDARD' | 'FIDELE' | 'VIP';

export interface Client {
  id: number;
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  adresse: string;
  numeroPermis: string;
  dateExpirationPermis: string;
  categorieClient: CategorieClient;
  dateInscription?: string;
  permisValide?: boolean;
  age?: number;
}

export interface EligibiliteClient {
  clientId: number;
  nomComplet: string;
  eligible: boolean;
  age: number;
  ageValide: boolean;
  permisValide: boolean;
  dateExpirationPermis: string;
  motifRefus?: string;
  categorieClient: CategorieClient;
}

export interface ClientFormData {
  cin: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  email: string;
  telephone: string;
  adresse: string;
  numeroPermis: string;
  dateExpirationPermis: string;
  categorieClient?: CategorieClient;
}
