import dotenv from 'dotenv';
import { initDatabase } from '../src/config/database';

// Charger les variables d'environnement pour les tests
dotenv.config();

// Configurer l'environnement de test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';

// Initialiser la base de données avant tous les tests
beforeAll(() => {
  initDatabase();
});
