import { User } from '../../src/types';

// Mock de la base de données
jest.mock('../../src/config/database', () => ({
  prepare: jest.fn(),
}));

import db from '../../src/config/database';
import { userModel } from '../../src/models/userModel';

const mockDb = db as jest.Mocked<typeof db>;

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer un nouvel utilisateur', () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword123',
        name: 'Test User',
        created_at: '2025-01-01T00:00:00',
      };

      const mockRun = jest.fn().mockReturnValue({ lastInsertRowid: 1 });
      const mockGet = jest.fn().mockReturnValue(mockUser);

      (mockDb.prepare as jest.Mock)
        .mockReturnValueOnce({ run: mockRun })
        .mockReturnValueOnce({ get: mockGet });

      const user = userModel.create('test@example.com', 'hashedPassword123', 'Test User');

      expect(user).toBeDefined();
      expect(user.id).toBe(1);
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'INSERT INTO users (email, password, name) VALUES (?, ?, ?)'
      );
      expect(mockRun).toHaveBeenCalledWith('test@example.com', 'hashedPassword123', 'Test User');
    });

    it('devrait échouer si l\'email existe déjà', () => {
      const mockRun = jest.fn().mockImplementation(() => {
        throw new Error('UNIQUE constraint failed: users.email');
      });

      (mockDb.prepare as jest.Mock).mockReturnValue({ run: mockRun });

      expect(() => {
        userModel.create('duplicate@example.com', 'password', 'User');
      }).toThrow();
    });
  });

  describe('findByEmail', () => {
    it('devrait trouver un utilisateur par email', () => {
      const mockUser: User = {
        id: 1,
        email: 'find@example.com',
        password: 'password',
        name: 'Find User',
        created_at: '2025-01-01T00:00:00',
      };

      const mockGet = jest.fn().mockReturnValue(mockUser);
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const user = userModel.findByEmail('find@example.com');

      expect(user).toBeDefined();
      expect(user?.email).toBe('find@example.com');
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM users WHERE email = ?');
      expect(mockGet).toHaveBeenCalledWith('find@example.com');
    });

    it('devrait retourner undefined si l\'email n\'existe pas', () => {
      const mockGet = jest.fn().mockReturnValue(undefined);
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const user = userModel.findByEmail('nonexistent@example.com');

      expect(user).toBeUndefined();
    });
  });

  describe('findById', () => {
    it('devrait trouver un utilisateur par id', () => {
      const mockUser: User = {
        id: 1,
        email: 'byid@example.com',
        password: 'password',
        name: 'ById User',
        created_at: '2025-01-01T00:00:00',
      };

      const mockGet = jest.fn().mockReturnValue(mockUser);
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const user = userModel.findById(1);

      expect(user).toBeDefined();
      expect(user?.id).toBe(1);
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?');
      expect(mockGet).toHaveBeenCalledWith(1);
    });

    it('devrait retourner undefined si l\'id n\'existe pas', () => {
      const mockGet = jest.fn().mockReturnValue(undefined);
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const user = userModel.findById(99999);

      expect(user).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('devrait retourner tous les utilisateurs', () => {
      const mockUsers: Partial<User>[] = [
        { id: 1, email: 'user1@example.com', name: 'User 1', created_at: '2025-01-01T00:00:00' },
        { id: 2, email: 'user2@example.com', name: 'User 2', created_at: '2025-01-01T00:00:00' },
      ];

      const mockAll = jest.fn().mockReturnValue(mockUsers);
      (mockDb.prepare as jest.Mock).mockReturnValue({ all: mockAll });

      const users = userModel.findAll();

      expect(users).toHaveLength(2);
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT id, email, name, created_at FROM users');
    });

    it('devrait retourner un tableau vide si aucun utilisateur', () => {
      const mockAll = jest.fn().mockReturnValue([]);
      (mockDb.prepare as jest.Mock).mockReturnValue({ all: mockAll });

      const users = userModel.findAll();

      expect(users).toEqual([]);
    });
  });
});
