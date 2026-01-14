import dotenv from 'dotenv';
import { initDatabase } from '../src/config/database';

// Charger les variables d'environnement pour les tests
// NODE_ENV et JWT_SECRET sont déjà définis dans setupEnv.ts (via setupFiles)
dotenv.config();

// Initialiser la base de données avant tous les tests
beforeAll(() => {
  initDatabase();
});
