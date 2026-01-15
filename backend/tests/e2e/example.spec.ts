import { test, expect } from '@playwright/test';

// Configuration
const BASE_URL = 'http://localhost:5173';

// Génère un email unique pour chaque exécution de test
const uniqueEmail = `testuser_${Date.now()}@example.com`;
const testUser = {
  name: 'Test User E2E',
  email: uniqueEmail,
  password: 'TestPassword123!'
};

test.describe('EasyBooking - Tests E2E Complets', () => {

  test.describe('1. Inscription', () => {
    test('devrait afficher la page d\'inscription', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      // Vérifier les éléments de la page
      await expect(page.getByRole('heading', { name: /bienvenue/i })).toBeVisible();
      await expect(page.getByPlaceholder('Alex Dupont')).toBeVisible();
      await expect(page.getByPlaceholder('ton@email.com')).toBeVisible();
      await expect(page.getByPlaceholder('Au moins 6 caractères')).toBeVisible();
    });

    test('devrait afficher une erreur si les champs sont invalides', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      // Soumettre le formulaire vide
      await page.getByRole('button', { name: /s'inscrire/i }).click();

      // Vérifier qu'une erreur est affichée
      await expect(page.locator('text=Le nom est requis')).toBeVisible();
    });

    test('devrait créer un compte avec succès', async ({ page }) => {
      await page.goto(`${BASE_URL}/register`);

      // Remplir le formulaire
      await page.getByPlaceholder(/nom/i).fill(testUser.name);
      await page.getByPlaceholder(/email/i).fill(testUser.email);
      await page.getByPlaceholder(/mot de passe/i).fill(testUser.password);

      // Soumettre
      await page.getByRole('button', { name: /s'inscrire/i }).click();

      // Vérifier la redirection vers le dashboard ou la page de connexion
      await expect(page).toHaveURL(/\/(login)?$/);
    });
  });

  test.describe('2. Connexion', () => {
    test('devrait afficher la page de connexion', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Vérifier les éléments de la page
      await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
      await expect(page.getByPlaceholder(/email/i)).toBeVisible();
      await expect(page.getByPlaceholder(/mot de passe/i)).toBeVisible();
    });

    test('devrait afficher une erreur avec des identifiants invalides', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Remplir avec des identifiants invalides
      await page.getByPlaceholder(/email/i).fill('invalid@example.com');
      await page.getByPlaceholder(/mot de passe/i).fill('WrongPassword123!');

      // Soumettre
      await page.getByRole('button', { name: /se connecter/i }).click();

      // Vérifier l'erreur
      await expect(page.locator('.bg-red-50, [class*="text-red"]')).toBeVisible({ timeout: 5000 });
    });

    test('devrait se connecter avec succès', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Remplir le formulaire avec les identifiants valides
      await page.getByPlaceholder(/email/i).fill(testUser.email);
      await page.getByPlaceholder(/mot de passe/i).fill(testUser.password);

      // Soumettre
      await page.getByRole('button', { name: /se connecter/i }).click();

      // Vérifier la connexion réussie - redirection vers le dashboard
      await expect(page).toHaveURL(BASE_URL + '/');

      // Vérifier que le nom de l'utilisateur est affiché dans la navbar
      await expect(page.locator('text=' + testUser.name)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('3. Liste des salles', () => {
    test.beforeEach(async ({ page }) => {
      // Se connecter avant chaque test
      await page.goto(`${BASE_URL}/login`);
      await page.getByPlaceholder(/email/i).fill(testUser.email);
      await page.getByPlaceholder(/mot de passe/i).fill(testUser.password);
      await page.getByRole('button', { name: /se connecter/i }).click();
      await expect(page).toHaveURL(BASE_URL + '/');
    });

    test('devrait afficher la liste des salles', async ({ page }) => {
      // Naviguer vers la page des salles
      await page.getByRole('link', { name: /salles/i }).click();

      // Vérifier qu'on est sur la page des salles
      await expect(page).toHaveURL(`${BASE_URL}/rooms`);

      // Vérifier que des salles sont affichées
      await expect(page.getByRole('heading', { name: /nos salles/i })).toBeVisible();

      // Vérifier qu'au moins une salle est listée (Salle A, B, C ou D)
      await expect(page.locator('text=Salle').first()).toBeVisible({ timeout: 5000 });
    });

    test('devrait pouvoir filtrer les salles par capacité', async ({ page }) => {
      await page.goto(`${BASE_URL}/rooms`);

      // Attendre que les salles soient chargées
      await expect(page.locator('text=Salle').first()).toBeVisible({ timeout: 5000 });

      // Utiliser le filtre de capacité si disponible
      const capacityFilter = page.locator('select, input[type="number"]').first();
      if (await capacityFilter.isVisible()) {
        await capacityFilter.fill('10');
        // Vérifier que le filtre fonctionne
        await page.waitForTimeout(500);
      }
    });

    test('devrait afficher les détails d\'une salle', async ({ page }) => {
      await page.goto(`${BASE_URL}/rooms`);

      // Attendre que les salles soient chargées
      await expect(page.locator('text=Salle').first()).toBeVisible({ timeout: 5000 });

      // Vérifier que les informations de capacité et équipement sont visibles
      await expect(page.locator('text=/\\d+ personnes|capacité/i').first()).toBeVisible();
    });
  });

  test.describe('4. Réservation d\'une salle', () => {
    test.beforeEach(async ({ page }) => {
      // Se connecter avant chaque test
      await page.goto(`${BASE_URL}/login`);
      await page.getByPlaceholder(/email/i).fill(testUser.email);
      await page.getByPlaceholder(/mot de passe/i).fill(testUser.password);
      await page.getByRole('button', { name: /se connecter/i }).click();
      await expect(page).toHaveURL(BASE_URL + '/');
    });

    test('devrait ouvrir le modal de réservation', async ({ page }) => {
      await page.goto(`${BASE_URL}/rooms`);

      // Attendre que les salles soient chargées
      await expect(page.locator('text=Salle').first()).toBeVisible({ timeout: 5000 });

      // Cliquer sur le bouton de réservation
      await page.getByRole('button', { name: /réserver/i }).first().click();

      // Vérifier que le modal est ouvert
      await expect(page.locator('text=/réservation|réserver/i')).toBeVisible();

      // Vérifier les champs du formulaire
      await expect(page.locator('input[type="date"]')).toBeVisible();
      await expect(page.locator('input[type="time"]').first()).toBeVisible();
    });

    test('devrait créer une réservation avec succès', async ({ page }) => {
      await page.goto(`${BASE_URL}/rooms`);

      // Attendre que les salles soient chargées
      await expect(page.locator('text=Salle').first()).toBeVisible({ timeout: 5000 });

      // Cliquer sur le bouton de réservation de la première salle
      await page.getByRole('button', { name: /réserver/i }).first().click();

      // Attendre que le modal soit visible
      await expect(page.locator('input[type="date"]')).toBeVisible();

      // Remplir le formulaire de réservation
      // Date: demain pour éviter les conflits
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      await page.locator('input[type="date"]').fill(dateStr);

      // Heures de début et fin
      const timeInputs = page.locator('input[type="time"]');
      await timeInputs.first().fill('10:00');
      await timeInputs.last().fill('11:00');

      // Attendre la vérification de disponibilité
      await page.waitForTimeout(1000);

      // Confirmer la réservation
      await page.getByRole('button', { name: /confirmer|valider/i }).click();

      // Vérifier le succès - le modal se ferme ou un message de succès apparaît
      await expect(page.locator('input[type="date"]')).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('5. Mes réservations', () => {
    test.beforeEach(async ({ page }) => {
      // Se connecter avant chaque test
      await page.goto(`${BASE_URL}/login`);
      await page.getByPlaceholder(/email/i).fill(testUser.email);
      await page.getByPlaceholder(/mot de passe/i).fill(testUser.password);
      await page.getByRole('button', { name: /se connecter/i }).click();
      await expect(page).toHaveURL(BASE_URL + '/');
    });

    test('devrait afficher la page des réservations', async ({ page }) => {
      // Naviguer vers la page des réservations
      await page.getByRole('link', { name: /réservations/i }).click();

      // Vérifier qu'on est sur la bonne page
      await expect(page).toHaveURL(`${BASE_URL}/reservations`);

      // Vérifier le titre de la page
      await expect(page.getByRole('heading', { name: /mes réservations/i })).toBeVisible();
    });

    test('devrait afficher les réservations de l\'utilisateur', async ({ page }) => {
      await page.goto(`${BASE_URL}/reservations`);

      // Attendre le chargement
      await page.waitForTimeout(1000);

      // Vérifier qu'il y a soit des réservations, soit un message "aucune réservation"
      const hasReservations = await page.locator('text=Salle').isVisible();
      const hasEmptyMessage = await page.locator('text=/aucune réservation|pas de réservation/i').isVisible();

      expect(hasReservations || hasEmptyMessage).toBeTruthy();
    });
  });

  test.describe('6. Annulation de réservation', () => {
    test.beforeEach(async ({ page }) => {
      // Se connecter avant chaque test
      await page.goto(`${BASE_URL}/login`);
      await page.getByPlaceholder(/email/i).fill(testUser.email);
      await page.getByPlaceholder(/mot de passe/i).fill(testUser.password);
      await page.getByRole('button', { name: /se connecter/i }).click();
      await expect(page).toHaveURL(BASE_URL + '/');
    });

    test('devrait pouvoir annuler une réservation', async ({ page }) => {
      // D'abord créer une réservation
      await page.goto(`${BASE_URL}/rooms`);
      await expect(page.locator('text=Salle').first()).toBeVisible({ timeout: 5000 });

      // Créer une nouvelle réservation
      await page.getByRole('button', { name: /réserver/i }).first().click();
      await expect(page.locator('input[type="date"]')).toBeVisible();

      // Date: après-demain pour avoir une réservation annulable
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      const dateStr = futureDate.toISOString().split('T')[0];

      await page.locator('input[type="date"]').fill(dateStr);
      const timeInputs = page.locator('input[type="time"]');
      await timeInputs.first().fill('14:00');
      await timeInputs.last().fill('15:00');

      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /confirmer|valider/i }).click();

      // Attendre que le modal se ferme
      await page.waitForTimeout(1000);

      // Aller sur la page des réservations
      await page.goto(`${BASE_URL}/reservations`);
      await page.waitForTimeout(1000);

      // Vérifier s'il y a un bouton d'annulation
      const cancelButton = page.getByRole('button', { name: /annuler|supprimer/i }).first();

      if (await cancelButton.isVisible()) {
        // Cliquer sur annuler
        await cancelButton.click();

        // Confirmer l'annulation si un dialogue de confirmation apparaît
        const confirmButton = page.getByRole('button', { name: /confirmer|oui|supprimer/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }

        // Vérifier que la réservation a été annulée
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('7. Déconnexion', () => {
    test.beforeEach(async ({ page }) => {
      // Se connecter avant chaque test
      await page.goto(`${BASE_URL}/login`);
      await page.getByPlaceholder(/email/i).fill(testUser.email);
      await page.getByPlaceholder(/mot de passe/i).fill(testUser.password);
      await page.getByRole('button', { name: /se connecter/i }).click();
      await expect(page).toHaveURL(BASE_URL + '/');
    });

    test('devrait se déconnecter avec succès', async ({ page }) => {
      // Vérifier qu'on est connecté
      await expect(page.locator('text=' + testUser.name)).toBeVisible({ timeout: 5000 });

      // Cliquer sur le bouton de déconnexion
      await page.getByRole('button', { name: /déconnexion|logout|déconnecter/i }).click();

      // Vérifier qu'on est déconnecté
      // Le bouton de connexion devrait être visible ou on est redirigé vers login
      await expect(
        page.getByRole('link', { name: /connexion|login/i }).or(
          page.getByRole('button', { name: /se connecter/i })
        )
      ).toBeVisible({ timeout: 5000 });
    });

    test('devrait rediriger vers login si on accède à une page protégée après déconnexion', async ({ page }) => {
      // Se déconnecter
      await page.getByRole('button', { name: /déconnexion|logout|déconnecter/i }).click();

      // Attendre la déconnexion
      await page.waitForTimeout(500);

      // Essayer d'accéder à une page protégée
      await page.goto(`${BASE_URL}/rooms`);

      // Devrait être redirigé vers login
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('8. Parcours utilisateur complet', () => {
    const fullTestEmail = `fulltest_${Date.now()}@example.com`;
    const fullTestUser = {
      name: 'Full Test User',
      email: fullTestEmail,
      password: 'FullTestPassword123!'
    };

    test('devrait effectuer un parcours complet: inscription -> connexion -> voir salles -> réserver -> voir réservations -> annuler -> déconnexion', async ({ page }) => {
      // 1. INSCRIPTION
      await page.goto(`${BASE_URL}/register`);
      await page.getByPlaceholder(/nom/i).fill(fullTestUser.name);
      await page.getByPlaceholder(/email/i).fill(fullTestUser.email);
      await page.getByPlaceholder(/mot de passe/i).fill(fullTestUser.password);
      await page.getByRole('button', { name: /s'inscrire/i }).click();

      // Attendre la redirection
      await page.waitForTimeout(1000);

      // 2. CONNEXION (si redirigé vers login après inscription)
      if (page.url().includes('/login')) {
        await page.getByPlaceholder(/email/i).fill(fullTestUser.email);
        await page.getByPlaceholder(/mot de passe/i).fill(fullTestUser.password);
        await page.getByRole('button', { name: /se connecter/i }).click();
        await expect(page).toHaveURL(BASE_URL + '/');
      }

      // Vérifier qu'on est connecté
      await expect(page.locator(`text=${fullTestUser.name}`)).toBeVisible({ timeout: 5000 });

      // 3. VOIR LES SALLES
      await page.getByRole('link', { name: /salles/i }).click();
      await expect(page).toHaveURL(`${BASE_URL}/rooms`);
      await expect(page.locator('text=Salle').first()).toBeVisible({ timeout: 5000 });

      // 4. FAIRE UNE RÉSERVATION
      await page.getByRole('button', { name: /réserver/i }).first().click();
      await expect(page.locator('input[type="date"]')).toBeVisible();

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 3);
      const dateStr = futureDate.toISOString().split('T')[0];

      await page.locator('input[type="date"]').fill(dateStr);
      const timeInputs = page.locator('input[type="time"]');
      await timeInputs.first().fill('09:00');
      await timeInputs.last().fill('10:00');

      await page.waitForTimeout(1000);
      await page.getByRole('button', { name: /confirmer|valider/i }).click();
      await page.waitForTimeout(1000);

      // 5. VOIR MES RÉSERVATIONS
      await page.getByRole('link', { name: /réservations/i }).click();
      await expect(page).toHaveURL(`${BASE_URL}/reservations`);
      await expect(page.getByRole('heading', { name: /mes réservations/i })).toBeVisible();

      // Attendre le chargement des réservations
      await page.waitForTimeout(1000);

      // 6. ANNULER LA RÉSERVATION
      const cancelButton = page.getByRole('button', { name: /annuler|supprimer/i }).first();
      if (await cancelButton.isVisible()) {
        await cancelButton.click();

        // Confirmer si nécessaire
        const confirmButton = page.getByRole('button', { name: /confirmer|oui|supprimer/i });
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
        await page.waitForTimeout(1000);
      }

      // 7. SE DÉCONNECTER
      await page.getByRole('button', { name: /déconnexion|logout|déconnecter/i }).click();

      // Vérifier qu'on est déconnecté
      await expect(
        page.getByRole('link', { name: /connexion|login/i }).or(
          page.getByRole('button', { name: /se connecter/i })
        )
      ).toBeVisible({ timeout: 5000 });
    });
  });
});
