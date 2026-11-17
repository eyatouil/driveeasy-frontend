import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../services/client.service';
import { ClientFormData } from '../../models/client.model';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  clientForm!: FormGroup;
  isEditMode = false;
  clientId?: number;
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      cin: ['', [Validators.required]],
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      dateNaissance: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required]],
      adresse: ['', [Validators.required]],
      numeroPermis: ['', [Validators.required]],
      dateExpirationPermis: ['', [Validators.required]],
      categorieClient: ['STANDARD', [Validators.required]]
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.clientId = Number(idParam);
      this.loadClient(this.clientId);
    }
  }

  loadClient(id: number): void {
    this.loading = true;
    this.clientService.getClientById(id).subscribe({
      next: (c) => {
        this.clientForm.patchValue({
          cin: c.cin,
          nom: c.nom,
          prenom: c.prenom,
          dateNaissance: c.dateNaissance,
          email: c.email,
          telephone: c.telephone,
          adresse: c.adresse,
          numeroPermis: c.numeroPermis,
          dateExpirationPermis: c.dateExpirationPermis,
          categorieClient: c.categorieClient
        });
        if (this.isEditMode) {
          this.clientForm.get('cin')?.disable();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger le client';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const raw = this.clientForm.getRawValue();
    const data: ClientFormData = {
      cin: raw.cin.trim().toUpperCase(),
      nom: raw.nom.trim(),
      prenom: raw.prenom.trim(),
      dateNaissance: raw.dateNaissance,
      email: raw.email.trim().toLowerCase(),
      telephone: raw.telephone.trim(),
      adresse: raw.adresse.trim(),
      numeroPermis: raw.numeroPermis.trim().toUpperCase(),
      dateExpirationPermis: raw.dateExpirationPermis,
      categorieClient: raw.categorieClient
    };

    if (this.isEditMode && this.clientId) {
      this.clientService.updateClient(this.clientId, data).subscribe({
        next: () => {
          this.router.navigate(['/clients', this.clientId]);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la mise à jour du client';
          this.loading = false;
        }
      });
    } else {
      this.clientService.createClient(data).subscribe({
        next: (created) => {
          this.router.navigate(['/clients', created.id]);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la création du client (vérifiez l\'unicité du CIN, email et permis)';
          this.loading = false;
        }
      });
    }
  }
}
