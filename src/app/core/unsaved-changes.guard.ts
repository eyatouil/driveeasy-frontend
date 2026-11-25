import { CanDeactivateFn } from '@angular/router';

/** Composants de formulaire pouvant signaler des modifications non enregistrées. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
}

/** Guard : demande confirmation avant de quitter un formulaire modifié. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  !component.hasUnsavedChanges || !component.hasUnsavedChanges()
    ? true
    : window.confirm('Des modifications ne sont pas enregistrées. Quitter cette page ?');
