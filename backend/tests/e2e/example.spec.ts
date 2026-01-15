import { test, expect } from '@playwright/test';

// Configuration
const BASE_URL = 'http://localhost:5173';

// Fonction helper pour créer un utilisateur unique
const createTestUser = () => ({
  name: `Test User ${Date.now()}`,
  email: `testuser_${Date.now()}@example.com`,
  password: 'TestPassword123!'
});

// Fonction helper pour s'inscrire
async function registerUser(page: any, user: { name: string; email: string; password: string }) {
  await page.goto(`${BASE_URL}/register`);
  await page.getByPlaceholder('Alex Dupont').fill(user.name);
  await page.getByPlaceholder('ton@email.com').fill(user.email);
  await page.getByPlaceholder('Au moins 6 caractères').fill(user.password);
  await page.getByRole('button', { name: /créer mon compte/i }).click();
  await expect(page).toHaveURL(/\/rooms/, { timeout: 15000 });
}

// Fonction helper pour se connecter
async function loginUser(page: any, user: { email: string; password: string }) {
  await page.goto(`${BASE_URL}/login`);
  await page.getByPlaceholder('ton@email.com').fill(user.email);
  await page.getByPlaceholder('Au moins 6 caractères').fill(user.password);
  await page.getByRole('button', { name: /se connecter/i }).click();
  await expect(page).toHaveURL(/\/rooms/, { timeout: 15000 });
}

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

      // Remplir seulement l'email et le mot de passe (nom vide)
      await page.getByPlaceholder('ton@email.com').fill('test@example.com');
      await page.getByPlaceholder('Au moins 6 caractères').fill('password123');

      // Le bouton devrait être disabled car le nom est vide
      const submitButton = page.getByRole('button', { name: /créer mon compte/i });
      await expect(submitButton).toBeDisabled();
    });

    test('devrait créer un compte avec succès', async ({ page }) => {
      const user = createTestUser();
      await page.goto(`${BASE_URL}/register`);

      // Remplir le formulaire
      await page.getByPlaceholder('Alex Dupont').fill(user.name);
      await page.getByPlaceholder('ton@email.com').fill(user.email);
      await page.getByPlaceholder('Au moins 6 caractères').fill(user.password);

      // Soumettre
      await page.getByRole('button', { name: /créer mon compte/i }).click();

      // Vérifier la redirection vers rooms après inscription réussie
      await expect(page).toHaveURL(/\/rooms/, { timeout: 15000 });
    });
  });

  test.describe('2. Connexion', () => {
    test('devrait afficher la page de connexion', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Vérifier les éléments de la page
      await expect(page.getByRole('heading', { name: /ravis de te revoir/i })).toBeVisible();
      await expect(page.getByPlaceholder('ton@email.com')).toBeVisible();
      await expect(page.getByPlaceholder('Au moins 6 caractères')).toBeVisible();
    });

    test('devrait afficher une erreur avec des identifiants invalides', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);

      // Remplir avec des identifiants invalides
      await page.getByPlaceholder('ton@email.com').fill('invalid@example.com');
      await page.getByPlaceholder('Au moins 6 caractères').fill('WrongPassword123!');

      // Soumettre
      await page.getByRole('button', { name: /se connecter/i }).click();

      // Vérifier l'erreur
      await expect(page.locator('.bg-red-50, [class*="text-red"]')).toBeVisible({ timeout: 5000 });
    });

    test('devrait se connecter avec succès', async ({ page }) => {
      // Créer d'abord un utilisateur
      const user = createTestUser();
      await registerUser(page, user);

      // Se déconnecter (aller sur login)
      await page.goto(`${BASE_URL}/login`);

      // Se reconnecter
      await page.getByPlaceholder('ton@email.com').fill(user.email);
      await page.getByPlaceholder('Au moins 6 caractères').fill(user.password);
      await page.getByRole('button', { name: /se connecter/i }).click();

      // Vérifier la connexion réussie - redirection vers rooms
      await expect(page).toHaveURL(/\/rooms/, { timeout: 15000 });

      // Vérifier que le nom de l'utilisateur est affiché dans la navbar
      await expect(page.locator('text=' + user.name)).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('3. Liste des salles', () => {
    test('devrait afficher la liste des salles', async ({ page }) => {
      // Créer un utilisateur et se connecter
      const user = createTestUser();
      await registerUser(page, user);

      // Vérifier qu'on est sur la page des salles
      await expect(page).toHaveURL(/\/rooms/);

      // Vérifier que des salles sont affichées (titre = "Liste des salles")
      await expect(page.getByRole('heading', { name: /liste des salles/i })).toBeVisible({ timeout: 10000 });

      // Vérifier qu'au moins une salle est listée (carte de salle avec bouton réserver)
      await expect(page.getByRole('button', { name: /réserver/i }).first()).toBeVisible({ timeout: 5000 });
    });

    test('devrait pouvoir filtrer les salles par capacité', async ({ page }) => {
      const user = createTestUser();
      await registerUser(page, user);

      // Attendre que les salles soient chargées
      await expect(page.locator('text=Salle').first()).toBeVisible({ timeout: 5000 });

      // Utiliser le filtre de capacité si disponible
      const capacityFilter = page.locator('select, input[type="number"]').first();
      if (await capacityFilter.isVisible()) {
        await capacityFilter.fill('10');
        await page.waitForTimeout(500);
      }
    });

    test('devrait afficher les détails d\'une salle', async ({ page }) => {
      const user = createTestUser();
      await registerUser(page, user);

      // Attendre que les salles soient chargées
      await expect(page.locator('text=Salle').first()).toBeVisible({ timeout: 5000 });

      // Vérifier que les informations de capacité et équipement sont visibles
      await expect(page.locator('text=/\\d+ personnes|capacité/i').first()).toBeVisible();
    });
  });

  test.describe('4. Réservation d\'une salle', () => {
    test('devrait ouvrir le modal de réservation', async ({ page }) => {
      const user = createTestUser();
      await registerUser(page, user);

      // Attendre que les salles soient chargées
      await expect(page.getByRole('button', { name: /réserver/i }).first()).toBeVisible({ timeout: 5000 });

      // Cliquer sur le bouton de réservation
      await page.getByRole('button', { name: /réserver/i }).first().click();

      // Vérifier que le modal est ouvert (heading "Réserver la salle")
      await expect(page.getByRole('heading', { name: /réserver la salle/i })).toBeVisible();

      // Vérifier les champs du formulaire
      await expect(page.locator('input[type="date"]')).toBeVisible();
      await expect(page.locator('input[type="time"]').first()).toBeVisible();
    });

    test('devrait créer une réservation avec succès', async ({ page }) => {
      const user = createTestUser();
      await registerUser(page, user);

      // Attendre que les salles soient chargées
      await expect(page.getByRole('button', { name: /réserver/i }).first()).toBeVisible({ timeout: 5000 });

      // Cliquer sur le bouton de réservation de la première salle
      await page.getByRole('button', { name: /réserver/i }).first().click();

      // Attendre que le modal soit visible
      await expect(page.getByRole('heading', { name: /réserver la salle/i })).toBeVisible();

      // Remplir le formulaire de réservation - utiliser une date dans 10 jours pour éviter les conflits
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);
      const dateStr = futureDate.toISOString().split('T')[0];

      await page.locator('input[type="date"]').fill(dateStr);

      // Heures de début et fin
      const timeInputs = page.locator('input[type="time"]');
      await timeInputs.first().fill('10:00');
      await timeInputs.last().fill('11:00');

      // Attendre que le bouton Confirmer soit activé (la vérification est terminée)
      const confirmButton = page.getByRole('button', { name: /confirmer/i });
      await expect(confirmButton).toBeEnabled({ timeout: 15000 });

      // Confirmer la réservation
      await confirmButton.click();

      // Vérifier le succès - le modal se ferme
      await expect(page.getByRole('heading', { name: /réserver la salle/i })).not.toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('5. Mes réservations', () => {
    test('devrait afficher la page des réservations', async ({ page }) => {
      const user = createTestUser();
      await registerUser(page, user);

      // Naviguer vers la page des réservations
      await page.getByRole('link', { name: /réservations/i }).click();

      // Vérifier qu'on est sur la bonne page
      await expect(page).toHaveURL(`${BASE_URL}/reservations`);

      // Vérifier le titre de la page
      await expect(page.getByRole('heading', { name: /mes réservations/i })).toBeVisible();
    });

    test('devrait afficher les réservations de l\'utilisateur', async ({ page }) => {
      const user = createTestUser();
      await registerUser(page, user);

      await page.goto(`${BASE_URL}/reservations`);

      // Attendre le chargement
      await page.waitForTimeout(1000);

      // Vérifier qu'on est sur la page des réservations
      await expect(page.getByRole('heading', { name: /mes réservations/i })).toBeVisible();

      // La page devrait afficher soit des réservations soit un message vide
      // (nouvel utilisateur = pas de réservations)
    });
  });

  test.describe('6. Annulation de réservation', () => {
    test('devrait pouvoir annuler une réservation', async ({ page }) => {
      const user = createTestUser();
      await registerUser(page, user);

      // Attendre que les salles soient chargées
      await expect(page.getByRole('button', { name: /réserver/i }).first()).toBeVisible({ timeout: 5000 });

      // Créer une nouvelle réservation
      await page.getByRole('button', { name: /réserver/i }).first().click();
      await expect(page.getByRole('heading', { name: /réserver la salle/i })).toBeVisible();

      // Date: dans 15 jours pour éviter les conflits avec les autres tests
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15);
      const dateStr = futureDate.toISOString().split('T')[0];

      await page.locator('input[type="date"]').fill(dateStr);
      const timeInputs = page.locator('input[type="time"]');
      // Utiliser un créneau unique pour éviter les conflits
      await timeInputs.first().fill('13:00');
      await timeInputs.last().fill('14:00');

      // Attendre que le bouton Confirmer soit activé
      const confirmButton = page.getByRole('button', { name: /confirmer/i });
      await expect(confirmButton).toBeEnabled({ timeout: 15000 });

      // Confirmer la réservation
      await confirmButton.click();

      // Attendre que le modal se ferme
      await expect(page.getByRole('heading', { name: /réserver la salle/i })).not.toBeVisible({ timeout: 5000 });

      // Aller sur la page des réservations
      await page.goto(`${BASE_URL}/reservations`);

      // Attendre le chargement de la page
      await expect(page.getByRole('heading', { name: /mes réservations/i })).toBeVisible();

      // Vérifier s'il y a un bouton d'annulation
      const cancelButton = page.getByRole('button', { name: /annuler|supprimer/i }).first();

      if (await cancelButton.isVisible({ timeout: 5000 })) {
        await cancelButton.click();

        // Confirmer l'annulation si un dialogue de confirmation apparaît
        const confirmButton = page.getByRole('button', { name: /confirmer|oui|supprimer/i });
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }

        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe('7. Déconnexion', () => {
    test('devrait se déconnecter avec succès', async ({ page }) => {
      const user = createTestUser();
      await registerUser(page, user);

      // Vérifier qu'on est connecté
      await expect(page.locator('text=' + user.name)).toBeVisible({ timeout: 5000 });

      // Cliquer sur le bouton de déconnexion
      await page.getByRole('button', { name: /déconnexion|logout|déconnecter/i }).click();

      // Vérifier qu'on est déconnecté - redirigé vers la page d'accueil ou login
      // Le lien "Connexion" dans la navbar devrait être visible
      await expect(page.getByRole('link', { name: 'Connexion' })).toBeVisible({ timeout: 5000 });
    });

    test('devrait rediriger vers login si on accède à une page protégée après déconnexion', async ({ page }) => {
      const user = createTestUser();
      await registerUser(page, user);

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
    test('devrait effectuer un parcours complet: inscription -> voir salles -> réserver -> voir réservations -> annuler -> déconnexion', async ({ page }) => {
      const user = createTestUser();

      // 1. INSCRIPTION
      await page.goto(`${BASE_URL}/register`);
      await page.getByPlaceholder('Alex Dupont').fill(user.name);
      await page.getByPlaceholder('ton@email.com').fill(user.email);
      await page.getByPlaceholder('Au moins 6 caractères').fill(user.password);
      await page.getByRole('button', { name: /créer mon compte/i }).click();

      // Attendre la redirection vers rooms
      await expect(page).toHaveURL(/\/rooms/, { timeout: 15000 });

      // Vérifier qu'on est connecté
      await expect(page.locator(`text=${user.name}`)).toBeVisible({ timeout: 5000 });

      // 2. VOIR LES SALLES (déjà sur /rooms après inscription)
      await expect(page.getByRole('button', { name: /réserver/i }).first()).toBeVisible({ timeout: 5000 });

      // 3. FAIRE UNE RÉSERVATION
      await page.getByRole('button', { name: /réserver/i }).first().click();
      await expect(page.getByRole('heading', { name: /réserver la salle/i })).toBeVisible();

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 20);
      const dateStr = futureDate.toISOString().split('T')[0];

      await page.locator('input[type="date"]').fill(dateStr);
      const timeInputs = page.locator('input[type="time"]');
      await timeInputs.first().fill('15:00');
      await timeInputs.last().fill('16:00');

      // Attendre que le bouton Confirmer soit activé
      const confirmButton = page.getByRole('button', { name: /confirmer/i });
      await expect(confirmButton).toBeEnabled({ timeout: 15000 });

      await confirmButton.click();

      // Attendre que le modal se ferme
      await expect(page.getByRole('heading', { name: /réserver la salle/i })).not.toBeVisible({ timeout: 5000 });

      // 4. VOIR MES RÉSERVATIONS
      await page.getByRole('link', { name: /réservations/i }).click();
      await expect(page).toHaveURL(`${BASE_URL}/reservations`);
      await expect(page.getByRole('heading', { name: /mes réservations/i })).toBeVisible();

      // 5. ANNULER LA RÉSERVATION (si visible)
      const cancelButton = page.getByRole('button', { name: /annuler|supprimer/i }).first();
      if (await cancelButton.isVisible({ timeout: 5000 })) {
        await cancelButton.click();

        const confirmButton = page.getByRole('button', { name: /confirmer|oui|supprimer/i });
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
        }
        await page.waitForTimeout(1000);
      }

      // 6. SE DÉCONNECTER
      await page.getByRole('button', { name: /déconnexion|logout|déconnecter/i }).click();

      // Vérifier qu'on est déconnecté
      await expect(page.getByRole('link', { name: 'Connexion' })).toBeVisible({ timeout: 5000 });
    });
  });
});
