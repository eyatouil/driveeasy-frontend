import { Component, ChangeDetectionStrategy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HasUnsavedChanges } from '../../core/unsaved-changes.guard';
import { VehiculeService } from '../../services/vehicule.service';
import { VehiculeFormData } from '../../models/vehicule.model';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-vehicule-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './vehicule-form.component.html',
  styleUrls: ['./vehicule-form.component.css']
})
export class VehiculeFormComponent implements OnInit, HasUnsavedChanges {
  private fb = inject(FormBuilder);
  private vehiculeService = inject(VehiculeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  vehiculeForm!: FormGroup;
  private saved = false;

  /** Utilisé par unsavedChangesGuard : confirmation si le formulaire a été modifié. */
  hasUnsavedChanges(): boolean {
    return this.vehiculeForm?.dirty === true && !this.saved;
  }
  isEditMode = false;
  vehiculeId?: number;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();

    this.vehiculeForm = this.fb.group({
      immatriculation: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z\s-]+$/)]],
      marque: ['', [Validators.required]],
      modele: ['', [Validators.required]],
      annee: [currentYear, [Validators.required, Validators.min(1990), Validators.max(currentYear)]],
      couleur: ['', [Validators.required]],
      carburant: ['ESSENCE', [Validators.required]],
      boite: ['MANUELLE', [Validators.required]],
      nbPlaces: [5, [Validators.required, Validators.min(1), Validators.max(9)]],
      kilometrage: [0, [Validators.required, Validators.min(0)]],
      prixJournalier: [50, [Validators.required, Validators.min(1)]],
      statut: ['DISPONIBLE', [Validators.required]],
      imageUrl: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.vehiculeId = Number(idParam);
      this.loadVehicule(this.vehiculeId);
    }
  }

  loadVehicule(id: number): void {
    this.loading = true;
    this.vehiculeService.getVehiculeById(id).subscribe({
      next: (v) => {
        this.vehiculeForm.patchValue({
          immatriculation: v.immatriculation,
          marque: v.marque,
          modele: v.modele,
          annee: v.annee,
          couleur: v.couleur,
          carburant: v.carburant,
          boite: v.boite,
          nbPlaces: v.nbPlaces,
          kilometrage: v.kilometrage,
          prixJournalier: v.prixJournalier,
          statut: v.statut,
          imageUrl: v.imageUrl || ''
        });
        if (this.isEditMode) {
          // L'immatriculation n'est généralement pas modifiée
          this.vehiculeForm.get('immatriculation')?.disable();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger le véhicule demandé';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.vehiculeForm.invalid) {
      this.vehiculeForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const rawData = this.vehiculeForm.getRawValue();
    const data: VehiculeFormData = {
      immatriculation: rawData.immatriculation.trim().toUpperCase(),
      marque: rawData.marque.trim(),
      modele: rawData.modele.trim(),
      annee: Number(rawData.annee),
      couleur: rawData.couleur.trim(),
      carburant: rawData.carburant,
      boite: rawData.boite,
      nbPlaces: Number(rawData.nbPlaces),
      kilometrage: Number(rawData.kilometrage),
      prixJournalier: Number(rawData.prixJournalier),
      statut: rawData.statut,
      imageUrl: rawData.imageUrl ? rawData.imageUrl.trim() : undefined
    };

    if (this.isEditMode && this.vehiculeId) {
      this.vehiculeService.updateVehicule(this.vehiculeId, data).subscribe({
        next: () => {
          this.saved = true;
          this.router.navigate(['/vehicules']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la mise à jour du véhicule';
          this.loading = false;
        }
      });
    } else {
      this.vehiculeService.createVehicule(data).subscribe({
        next: () => {
          this.saved = true;
          this.router.navigate(['/vehicules']);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de l\'ajout du véhicule (vérifiez l\'unicité de l\'immatriculation)';
          this.loading = false;
        }
      });
    }
  }
}
