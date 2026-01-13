import { reservationModel } from '../../src/models/reservationModel';
import { roomModel } from '../../src/models/roomModel';
import { userModel } from '../../src/models/userModel';
import db from '../../src/config/database';

describe('ReservationModel', () => {
  let testUserId: number;
  let testRoomId: number;

  beforeEach(() => {
    // Nettoyer les tables
    db.exec('DELETE FROM reservations');
    db.exec('DELETE FROM users');

    // Créer un utilisateur de test
    const user = userModel.create('reservationtest@example.com', 'password', 'Test User');
    testUserId = user.id;

    // Récupérer une salle de test
    const rooms = roomModel.findAll();
    testRoomId = rooms[0].id;
  });

  describe('create', () => {
    it('devrait créer une réservation', () => {
      const reservation = reservationModel.create(
        testUserId,
        testRoomId,
        '2025-12-15T10:00:00',
        '2025-12-15T11:00:00'
      );

      expect(reservation).toBeDefined();
      expect(reservation.id).toBeDefined();
      expect(reservation.user_id).toBe(testUserId);
      expect(reservation.room_id).toBe(testRoomId);
    });
  });

  describe('findById', () => {
    it('devrait trouver une réservation par id', () => {
      const created = reservationModel.create(
        testUserId,
        testRoomId,
        '2025-12-15T14:00:00',
        '2025-12-15T15:00:00'
      );

      const reservation = reservationModel.findById(created.id);

      expect(reservation).toBeDefined();
      expect(reservation?.id).toBe(created.id);
    });

    it('devrait retourner undefined si l\'id n\'existe pas', () => {
      const reservation = reservationModel.findById(99999);

      expect(reservation).toBeUndefined();
    });
  });

  describe('findByUserId', () => {
    it('devrait retourner les réservations d\'un utilisateur', () => {
      reservationModel.create(testUserId, testRoomId, '2025-12-16T10:00:00', '2025-12-16T11:00:00');
      reservationModel.create(testUserId, testRoomId, '2025-12-17T10:00:00', '2025-12-17T11:00:00');

      const reservations = reservationModel.findByUserId(testUserId);

      expect(reservations.length).toBe(2);
      expect(reservations[0]).toHaveProperty('room_name');
    });

    it('devrait retourner un tableau vide si l\'utilisateur n\'a pas de réservations', () => {
      const reservations = reservationModel.findByUserId(99999);

      expect(reservations).toEqual([]);
    });
  });

  describe('findByRoomId', () => {
    it('devrait retourner les réservations d\'une salle', () => {
      reservationModel.create(testUserId, testRoomId, '2025-12-18T10:00:00', '2025-12-18T11:00:00');

      const reservations = reservationModel.findByRoomId(testRoomId);

      expect(reservations.length).toBeGreaterThan(0);
      expect(reservations[0].room_id).toBe(testRoomId);
    });
  });

  describe('delete', () => {
    it('devrait supprimer une réservation', () => {
      const created = reservationModel.create(
        testUserId,
        testRoomId,
        '2025-12-19T10:00:00',
        '2025-12-19T11:00:00'
      );

      const result = reservationModel.delete(created.id);

      expect(result).toBe(true);
      expect(reservationModel.findById(created.id)).toBeUndefined();
    });

    it('devrait retourner false si la réservation n\'existe pas', () => {
      const result = reservationModel.delete(99999);

      expect(result).toBe(false);
    });
  });

  describe('belongsToUser', () => {
    it('devrait retourner true si la réservation appartient à l\'utilisateur', () => {
      const created = reservationModel.create(
        testUserId,
        testRoomId,
        '2025-12-20T10:00:00',
        '2025-12-20T11:00:00'
      );

      const belongs = reservationModel.belongsToUser(created.id, testUserId);

      expect(belongs).toBe(true);
    });

    it('devrait retourner false si la réservation n\'appartient pas à l\'utilisateur', () => {
      const created = reservationModel.create(
        testUserId,
        testRoomId,
        '2025-12-21T10:00:00',
        '2025-12-21T11:00:00'
      );

      const belongs = reservationModel.belongsToUser(created.id, 99999);

      expect(belongs).toBe(false);
    });
  });
});
