# DriveEasy - Application Web Frontend (Angular 22)

[![Angular](https://img.shields.io/badge/Angular-22.2.0-dd0031.svg)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)
[![Status](https://img.shields.io/badge/Components-Standalone-green.svg)](https://angular.dev)

Interface utilisateur moderne, réactive et ergonomique pour les agents de l'agence de location automobile **DriveEasy**.

---

## 1. Présentation & Architecture Frontend

L'application est construite avec **Angular 22** en adoptant l'architecture moderne basée à 100% sur les **Standalone Components** (sans modules `NgModule` superflus).
Elle communique exclusivement avec la passerelle **API Gateway** sur le port `8080` (CORS configuré pour `http://localhost:4200`).

### Structure des Dossiers

```
driveeasy-frontend/
├── src/
│   ├── app/
│   │   ├── models/                    # Modèles et interfaces TypeScript
│   │   │   ├── vehicule.model.ts      # Entités et formulaires Véhicules
│   │   │   ├── client.model.ts        # Entités, éligibilité et statuts Clients
│   │   │   └── location.model.ts      # Contrats de location, simulations, KPI
│   │   ├── services/                  # Services d'appels API REST via Gateway
│   │   │   ├── vehicule.service.ts    # CRUD véhicules & filtres
│   │   │   ├── client.service.ts      # CRUD clients & contrôle éligibilité
│   │   │   └── location.service.ts    # Cycle de vie location & statistiques
│   │   ├── pages/                     # Composants Standalone de vues
│   │   │   ├── dashboard/             # Tableau de bord KPI & métriques
│   │   │   ├── vehicules/             # Catalogue des véhicules avec filtres
│   │   │   ├── vehicule-form/         # Formulaire réactif véhicule (New / Edit)
│   │   │   ├── clients/               # Répertoire des clients & alertes permis
│   │   │   ├── client-detail/         # Fiche client, éligibilité & historique
│   │   │   ├── client-form/           # Formulaire réactif client (New / Edit)
│   │   │   ├── location-wizard/       # Assistant de réservation en 5 étapes
│   │   │   ├── locations/             # Suivi des locations & modal enrichi
│   │   │   └── location-retour/       # Restitution, pénalités & facture imprimable
│   │   ├── app.ts                     # Composant racine
│   │   ├── app.html                   # Shell applicatif & barre de navigation
│   │   ├── app.css                    # Styles de la barre de navigation
│   │   ├── app.routes.ts              # Routage de l'application
│   │   └── app.config.ts              # Configuration HttpClient & Router
│   ├── styles.css                     # Système de design global
│   └── index.html
├── angular.json
├── package.json
└── README.md
```

---

## 2. Écrans Réalisés & Fonctionnalités

| Écran | Route | Fonctionnalités Clés |
| :--- | :--- | :--- |
| **Tableau de bord** | `/dashboard` | KPI temps réel (disponibles, loués, maintenance, CA mois), jauge d'occupation, top 5 véhicules les plus loués, dernières réservations |
| **Catalogue Véhicules** | `/vehicules` | Grille de cartes réactives, filtres instantanés (carburant, statut, prix max), suppression sécurisée |
| **Formulaire Véhicule** | `/vehicules/new`, `/vehicules/:id/edit` | Formulaire réactif avec validation (immatriculation unique, prix > 0, année cohérente) |
| **Liste des Clients** | `/clients` | Tableau avec recherche par nom/CIN/email, badges de fidélité (`STANDARD`, `FIDELE`, `VIP`), alerte visuelle permis expiré |
| **Fiche Client** | `/clients/:id` | Coordonnées, bandeau de contrôle d'éligibilité en temps réel (âge ≥ 21 ans et permis valide), historique complet des locations |
| **Formulaire Client** | `/clients/new`, `/clients/:id/edit` | Création / modification d'un client avec validation du format de CIN, email et dates |
| **Assistant Nouvelle Location** | `/locations/new` | **Assistant interactif en 5 étapes** :<br>1. Sélection client & vérification immédiate d'éligibilité<br>2. Sélection de la période & durée<br>3. Choix du véhicule disponible<br>4. Simulation tarifaire en direct avec application de la remise fidélité<br>5. Récapitulatif et confirmation finale |
| **Gestion des Locations** | `/locations` | Filtres par onglets de statut (`RESERVEE`, `EN_COURS`, `TERMINEE`, `ANNULEE`), actions contextuelles ("Démarrer", "Retour", "Annuler"), modal avec détail enrichi agrégé |
| **Restitution Véhicule** | `/locations/:id/retour` | Saisie du kilométrage de retour, détection automatique du retard et calcul des pénalités (1,5× tarif/jour), **facture définitive imprimable** (`window.print()`) |

---

## 3. Prérequis & Installation

- **Node.js** v20 ou supérieur (v22 recommandé)
- **npm** v10 ou supérieur
- Le backend DriveEasy doit être démarré (API Gateway sur le port `8080`)

### Installation des dépendances
```bash
cd driveeasy-frontend
npm install
```

### Lancement du serveur de développement
```bash
npm start
# Ou bien : npx ng serve --port 4200
```
L'application est accessible sur : **`http://localhost:4200`**

### Compilation pour la production
```bash
npm run build
```
Les artefacts optimisés sont générés dans `dist/driveeasy-frontend/`.

---

## 4. Scénarios de Test et Démonstration

1. **Test Éligibilité Âge (< 21 ans)** :
   - Allez sur `/locations/new`
   - Sélectionnez le client **Amine Jaziri** (19 ans)
   - *Résultat attendu* : Le bandeau d'inéligibilité s'affiche immédiatement en rouge ("Âge insuffisant : 19 ans - minimum requis : 21 ans") et le bouton "Continuer" est désactivé.

2. **Test Éligibilité Permis Expiré** :
   - Sélectionnez la cliente **Sarah Mansouri**
   - *Résultat attendu* : Le bandeau indique le refus pour permis expiré et bloque la réservation.

3. **Test Réservation avec Remise Fidélité VIP (10%)** :
   - Sélectionnez le client **Karim Ben Romdhane** (VIP)
   - Choisissez une période de 4 jours et sélectionnez la **Peugeot 208 GT** (45 €/jour)
   - À l'étape 4 (Simulation), constatez la remise VIP appliquée de 10% (-18,00 €) pour un total de 162,00 €.

4. **Test Cycle Complet (Départ $\rightarrow$ Restitution avec Pénalité)** :
   - Sur `/locations`, cliquez sur "Démarrer" pour la réservation créée : le statut passe à `EN_COURS` et le véhicule devient `LOUE`.
   - Cliquez sur "Retour", saisissez une date postérieure à la date prévue (+2 jours) et le kilométrage de retour : la pénalité de retard (1,5x) est calculée automatiquement.
   - Validez : le véhicule repasse automatiquement à `DISPONIBLE` et la facture finale s'affiche avec le bouton d'impression.
