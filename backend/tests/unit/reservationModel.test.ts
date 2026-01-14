import { Reservation, ReservationWithDetails } from '../../src/types';

// Mock de la base de données
jest.mock('../../src/config/database', () => ({
  prepare: jest.fn(),
}));

import db from '../../src/config/database';
import { reservationModel } from '../../src/models/reservationModel';

const mockDb = db as jest.Mocked<typeof db>;

describe('ReservationModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer une réservation', () => {
      const mockReservation: Reservation = {
        id: 1,
        user_id: 1,
        room_id: 1,
        start_time: '2025-12-15T10:00:00',
        end_time: '2025-12-15T11:00:00',
        created_at: '2025-01-01T00:00:00',
      };

      const mockRun = jest.fn().mockReturnValue({ lastInsertRowid: 1 });
      const mockGet = jest.fn().mockReturnValue(mockReservation);

      (mockDb.prepare as jest.Mock)
        .mockReturnValueOnce({ run: mockRun })
        .mockReturnValueOnce({ get: mockGet });

      const reservation = reservationModel.create(1, 1, '2025-12-15T10:00:00', '2025-12-15T11:00:00');

      expect(reservation).toBeDefined();
      expect(reservation.id).toBeDefined();
      expect(reservation.user_id).toBe(1);
      expect(reservation.room_id).toBe(1);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'INSERT INTO reservations (user_id, room_id, start_time, end_time) VALUES (?, ?, ?, ?)'
      );
      expect(mockRun).toHaveBeenCalledWith(1, 1, '2025-12-15T10:00:00', '2025-12-15T11:00:00');
    });
  });

  describe('findById', () => {
    it('devrait trouver une réservation par id', () => {
      const mockReservation: Reservation = {
        id: 1,
        user_id: 1,
        room_id: 1,
        start_time: '2025-12-15T14:00:00',
        end_time: '2025-12-15T15:00:00',
        created_at: '2025-01-01T00:00:00',
      };

      const mockGet = jest.fn().mockReturnValue(mockReservation);
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const reservation = reservationModel.findById(1);

      expect(reservation).toBeDefined();
      expect(reservation?.id).toBe(1);
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM reservations WHERE id = ?');
      expect(mockGet).toHaveBeenCalledWith(1);
    });

    it('devrait retourner undefined si l\'id n\'existe pas', () => {
      const mockGet = jest.fn().mockReturnValue(undefined);
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const reservation = reservationModel.findById(99999);

      expect(reservation).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('devrait retourner les réservations d\'un utilisateur', () => {
      const mockReservations: ReservationWithDetails[] = [
        {
          id: 1,
          user_id: 1,
          room_id: 1,
          start_time: '2025-12-16T10:00:00',
          end_time: '2025-12-16T11:00:00',
          created_at: '2025-01-01T00:00:00',
          room_name: 'Salle A',
        },
        {
          id: 2,
          user_id: 1,
          room_id: 2,
          start_time: '2025-12-17T10:00:00',
          end_time: '2025-12-17T11:00:00',
          created_at: '2025-01-01T00:00:00',
          room_name: 'Salle B',
        },
      ];

      const mockAll = jest.fn().mockReturnValue(mockReservations);
      (mockDb.prepare as jest.Mock).mockReturnValue({ all: mockAll });

      const reservations = reservationModel.findByUserId(1);

      expect(reservations.length).toBe(2);
      expect(reservations[0]).toHaveProperty('room_name');
      expect(mockAll).toHaveBeenCalledWith(1);
    });

    it('devrait retourner un tableau vide si l\'utilisateur n\'a pas de réservations', () => {
      const mockAll = jest.fn().mockReturnValue([]);
      (mockDb.prepare as jest.Mock).mockReturnValue({ all: mockAll });

      const reservations = reservationModel.findByUserId(99999);

      expect(reservations).toEqual([]);
    });
  });

  describe('findByRoomId', () => {
    it('devrait retourner les réservations d\'une salle', () => {
      const mockReservations: Reservation[] = [
        {
          id: 1,
          user_id: 1,
          room_id: 1,
          start_time: '2025-12-18T10:00:00',
          end_time: '2025-12-18T11:00:00',
          created_at: '2025-01-01T00:00:00',
        },
      ];

      const mockAll = jest.fn().mockReturnValue(mockReservations);
      (mockDb.prepare as jest.Mock).mockReturnValue({ all: mockAll });

      const reservations = reservationModel.findByRoomId(1);

      expect(reservations.length).toBe(1);
      expect(reservations[0].room_id).toBe(1);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT * FROM reservations WHERE room_id = ? ORDER BY start_time'
      );
      expect(mockAll).toHaveBeenCalledWith(1);
    });

    it('devrait retourner un tableau vide si la salle n\'a pas de réservations', () => {
      const mockAll = jest.fn().mockReturnValue([]);
      (mockDb.prepare as jest.Mock).mockReturnValue({ all: mockAll });

      const reservations = reservationModel.findByRoomId(99999);

      expect(reservations).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('devrait retourner toutes les réservations avec détails', () => {
      const mockReservations: ReservationWithDetails[] = [
        {
          id: 1,
          user_id: 1,
          room_id: 1,
          start_time: '2025-12-18T10:00:00',
          end_time: '2025-12-18T11:00:00',
          created_at: '2025-01-01T00:00:00',
          room_name: 'Salle A',
          user_name: 'John Doe',
        },
      ];

      const mockAll = jest.fn().mockReturnValue(mockReservations);
      (mockDb.prepare as jest.Mock).mockReturnValue({ all: mockAll });

      const reservations = reservationModel.findAll();

      expect(reservations.length).toBe(1);
      expect(reservations[0]).toHaveProperty('room_name');
      expect(reservations[0]).toHaveProperty('user_name');
    });
  });

  describe('delete', () => {
    it('devrait supprimer une réservation', () => {
      const mockRun = jest.fn().mockReturnValue({ changes: 1 });
      (mockDb.prepare as jest.Mock).mockReturnValue({ run: mockRun });

      const result = reservationModel.delete(1);

      expect(result).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith('DELETE FROM reservations WHERE id = ?');
      expect(mockRun).toHaveBeenCalledWith(1);
    });

    it('devrait retourner false si la réservation n\'existe pas', () => {
      const mockRun = jest.fn().mockReturnValue({ changes: 0 });
      (mockDb.prepare as jest.Mock).mockReturnValue({ run: mockRun });

      const result = reservationModel.delete(99999);

      expect(result).toBe(false);
    });
  });

  describe('belongsToUser', () => {
    it('devrait retourner true si la réservation appartient à l\'utilisateur', () => {
      const mockGet = jest.fn().mockReturnValue({ count: 1 });
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const belongs = reservationModel.belongsToUser(1, 1);

      expect(belongs).toBe(true);
      expect(mockDb.prepare).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM reservations WHERE id = ? AND user_id = ?'
      );
      expect(mockGet).toHaveBeenCalledWith(1, 1);
    });

    it('devrait retourner false si la réservation n\'appartient pas à l\'utilisateur', () => {
      const mockGet = jest.fn().mockReturnValue({ count: 0 });
      (mockDb.prepare as jest.Mock).mockReturnValue({ get: mockGet });

      const belongs = reservationModel.belongsToUser(1, 99999);

      expect(belongs).toBe(false);
    });
  });
});
