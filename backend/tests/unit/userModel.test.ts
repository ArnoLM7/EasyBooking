import { userModel } from '../../src/models/userModel';
import db from '../../src/config/database';

describe('UserModel', () => {
  // Nettoyer la table users avant chaque test
  beforeEach(() => {
    db.exec('DELETE FROM users');
  });

  describe('create', () => {
    it('devrait créer un nouvel utilisateur', () => {
      const user = userModel.create('test@example.com', 'hashedPassword123', 'Test User');

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.password).toBe('hashedPassword123');
    });

    it('devrait échouer si l\'email existe déjà', () => {
      userModel.create('duplicate@example.com', 'password1', 'User 1');

      expect(() => {
        userModel.create('duplicate@example.com', 'password2', 'User 2');
      }).toThrow();
    });
  });

  describe('findByEmail', () => {
    it('devrait trouver un utilisateur par email', () => {
      userModel.create('find@example.com', 'password', 'Find User');

      const user = userModel.findByEmail('find@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('find@example.com');
    });

    it('devrait retourner undefined si l\'email n\'existe pas', () => {
      const user = userModel.findByEmail('nonexistent@example.com');

      expect(user).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('devrait trouver un utilisateur par id', () => {
      const createdUser = userModel.create('byid@example.com', 'password', 'ById User');

      const user = userModel.findById(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
    });

    it('devrait retourner undefined si l\'id n\'existe pas', () => {
      const user = userModel.findById(99999);

      expect(user).toBeUndefined();
    });
  });
});
