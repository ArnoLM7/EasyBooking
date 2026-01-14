// Ce fichier s'exécute AVANT les imports des fichiers de test
// via setupFiles dans jest.config.js
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';
