import { Room } from '../../src/types';

// Mock de la base de données
jest.mock('../../src/config/database', () => ({
  prepare: jest.fn(),
}));

import db from '../../src/config/database';
import { roomModel } from '../../src/models/roomModel';

const mockDb = db as jest.Mocked<typeof db>;

describe('RoomModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('devrait retourner toutes les salles', () => {
      const mockRooms: Room[] = [
        { id: 1, name: 'Salle A', capacity: 10, equipment: 'Projecteur', created_at: '2025-01-01T00:00:00' },
        { id: 2, name: 'Salle B', capacity: 20, equipment: 'Visioconférence', created_at: '2025-01-01T00:00:00' },
      ];

      const mockAll = jest.fn().mockReturnValue(mockRooms);
      (mockDb.prepare as jest.Mock).mockReturnValue({ all: mockAll });

      const rooms = roomModel.findAll();

      expect(Array.isArray(rooms)).toBe(true);
      expect(rooms.length).toBe(2);
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM rooms ORDER BY name');
    });

    it('devrait retourner des salles avec les bonnes propriétés', () => {
      const mockRooms: Room[] = [
        { id: 1, name: 'Salle A', capacity: 10, equipment: 'Projecteur', created_at: '2025-01-01T00:00:00' },
      ];

      const mockAll = jest.fn().mockReturnValue(mockRooms);
      (mockDb.prepare as jest.Mock).mockReturnValue({ all: mockAll });

      const rooms = roomModel.findAll();
      const room = rooms[0];

      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      expect(room).toHaveProperty('capacity');
      expect(room).toHaveProperty('equipment');
    });

    it('devrait retourner un tableau vide si aucune salle', () => {
      const mockAll = jest.fn().mockReturnValue([]);
      (mockDb.prepare as jest.Mock).mockReturnValue({ all: mockAll });

      const rooms = roomModel.findAll();

      expect(rooms).toEqual([]);
    });
  });

  describe('findById', () => {
    it('devrait trouver une salle par id', () => {
      const mockRoom: Room = {
        id: 1,
        name: 'Salle A',
        capacity: 10,
        equipment: 'Projecteur',
        created_at: '2025-01-01T00:00:00',
      };

      const mockGet = jest.fn().mockReturnValue(mockRoom);
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const room = roomModel.findById(1);

      expect(room).toBeDefined();
      expect(room?.id).toBe(1);
      expect(room?.name).toBe('Salle A');
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM rooms WHERE id = ?');
      expect(mockGet).toHaveBeenCalledWith(1);
    });

    it('devrait retourner undefined si l\'id n\'existe pas', () => {
      const mockGet = jest.fn().mockReturnValue(undefined);
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const room = roomModel.findById(99999);

      expect(room).toBeUndefined();
    });
  });

  describe('create', () => {
    it('devrait créer une nouvelle salle', () => {
      const mockRoom: Room = {
        id: 1,
        name: 'Nouvelle Salle',
        capacity: 15,
        equipment: 'Tableau blanc',
        created_at: '2025-01-01T00:00:00',
      };

      const mockRun = jest.fn().mockReturnValue({ lastInsertRowid: 1 });
      const mockGet = jest.fn().mockReturnValue(mockRoom);

      (mockDb.prepare as jest.Mock)
        .mockReturnValueOnce({ run: mockRun })
        .mockReturnValueOnce({ get: mockGet });

      const room = roomModel.create('Nouvelle Salle', 15, 'Tableau blanc');

      expect(room).toBeDefined();
      expect(room.id).toBe(1);
      expect(room.name).toBe('Nouvelle Salle');
      expect(room.capacity).toBe(15);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'INSERT INTO rooms (name, capacity, equipment) VALUES (?, ?, ?)'
      );
      expect(mockRun).toHaveBeenCalledWith('Nouvelle Salle', 15, 'Tableau blanc');
    });

    it('devrait créer une salle sans équipement', () => {
      const mockRoom: Room = {
        id: 2,
        name: 'Salle Simple',
        capacity: 5,
        equipment: null,
        created_at: '2025-01-01T00:00:00',
      };

      const mockRun = jest.fn().mockReturnValue({ lastInsertRowid: 2 });
      const mockGet = jest.fn().mockReturnValue(mockRoom);

      (mockDb.prepare as jest.Mock)
        .mockReturnValueOnce({ run: mockRun })
        .mockReturnValueOnce({ get: mockGet });

      const room = roomModel.create('Salle Simple', 5, null);

      expect(room.equipment).toBeNull();
      expect(mockRun).toHaveBeenCalledWith('Salle Simple', 5, null);
    });
  });

  describe('isAvailable', () => {
    it('devrait retourner true si la salle est disponible', () => {
      const mockGet = jest.fn().mockReturnValue({ count: 0 });
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const isAvailable = roomModel.isAvailable(1, '2025-12-01T10:00:00', '2025-12-01T11:00:00');

      expect(isAvailable).toBe(true);
      expect(mockGet).toHaveBeenCalledWith(
        1,
        '2025-12-01T11:00:00',
        '2025-12-01T10:00:00',
        '2025-12-01T11:00:00',
        '2025-12-01T10:00:00',
        '2025-12-01T10:00:00',
        '2025-12-01T11:00:00'
      );
    });

    it('devrait retourner false si la salle est réservée', () => {
      const mockGet = jest.fn().mockReturnValue({ count: 1 });
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const isAvailable = roomModel.isAvailable(1, '2025-12-01T10:00:00', '2025-12-01T11:00:00');

      expect(isAvailable).toBe(false);
    });

    it('devrait retourner false pour un chevauchement partiel', () => {
      const mockGet = jest.fn().mockReturnValue({ count: 1 });
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const isAvailable = roomModel.isAvailable(1, '2025-12-01T11:00:00', '2025-12-01T13:00:00');

      expect(isAvailable).toBe(false);
    });

    it('devrait exclure une réservation spécifique', () => {
      const mockGet = jest.fn().mockReturnValue({ count: 0 });
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const isAvailable = roomModel.isAvailable(1, '2025-12-01T10:00:00', '2025-12-01T11:00:00', 5);

      expect(isAvailable).toBe(true);
      expect(mockGet).toHaveBeenCalledWith(
        1,
        '2025-12-01T11:00:00',
        '2025-12-01T10:00:00',
        '2025-12-01T11:00:00',
        '2025-12-01T10:00:00',
        '2025-12-01T10:00:00',
        '2025-12-01T11:00:00',
        5
      );
    });
  });
});
