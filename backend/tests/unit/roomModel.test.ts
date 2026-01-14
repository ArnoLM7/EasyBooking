import { roomModel } from '../../src/models/roomModel';
import db from '../../src/config/database';

describe('RoomModel', () => {
  // Les salles sont créées par initDatabase, on les garde pour les tests

  describe('findAll', () => {
    it('devrait retourner toutes les salles', () => {
      const rooms = roomModel.findAll();

      expect(Array.isArray(rooms)).toBe(true);
      expect(rooms.length).toBeGreaterThan(0);
    });

    it('devrait retourner des salles avec les bonnes propriétés', () => {
      const rooms = roomModel.findAll();
      const room = rooms[0];

      expect(room).toHaveProperty('id');
      expect(room).toHaveProperty('name');
      expect(room).toHaveProperty('capacity');
      expect(room).toHaveProperty('equipment');
    });
  });

  describe('findById', () => {
    it('devrait trouver une salle par id', () => {
      const rooms = roomModel.findAll();
      const firstRoom = rooms[0];

      const room = roomModel.findById(firstRoom.id);

      expect(room).toBeDefined();
      expect(room?.id).toBe(firstRoom.id);
      expect(room?.name).toBe(firstRoom.name);
    });

    it('devrait retourner undefined si l\'id n\'existe pas', () => {
      const room = roomModel.findById(99999);

      expect(room).toBeUndefined();
    });
  });

  describe('isAvailable', () => {
    beforeEach(() => {
      // Nettoyer les réservations avant chaque test
      db.exec('DELETE FROM reservations');
    });

    it('devrait retourner true si la salle est disponible', () => {
      const rooms = roomModel.findAll();
      const roomId = rooms[0].id;

      const isAvailable = roomModel.isAvailable(
        roomId,
        '2025-12-01T10:00:00',
        '2025-12-01T11:00:00'
      );

      expect(isAvailable).toBe(true);
    });

    it('devrait retourner false si la salle est réservée', () => {
      const rooms = roomModel.findAll();
      const roomId = rooms[0].id;

      // Créer un utilisateur pour la réservation
      db.exec("INSERT OR IGNORE INTO users (email, password, name) VALUES ('test@test.com', 'pass', 'Test')");
      const user = db.prepare("SELECT id FROM users WHERE email = 'test@test.com'").get() as { id: number };

      // Créer une réservation
      db.prepare(
        'INSERT INTO reservations (user_id, room_id, start_time, end_time) VALUES (?, ?, ?, ?)'
      ).run(user.id, roomId, '2025-12-01T10:00:00', '2025-12-01T11:00:00');

      const isAvailable = roomModel.isAvailable(
        roomId,
        '2025-12-01T10:00:00',
        '2025-12-01T11:00:00'
      );

      expect(isAvailable).toBe(false);
    });

    it('devrait retourner false pour un chevauchement partiel', () => {
      const rooms = roomModel.findAll();
      const roomId = rooms[0].id;

      // Créer un utilisateur
      db.exec("INSERT OR IGNORE INTO users (email, password, name) VALUES ('test2@test.com', 'pass', 'Test2')");
      const user = db.prepare("SELECT id FROM users WHERE email = 'test2@test.com'").get() as { id: number };

      // Réservation de 10h à 12h
      db.prepare(
        'INSERT INTO reservations (user_id, room_id, start_time, end_time) VALUES (?, ?, ?, ?)'
      ).run(user.id, roomId, '2025-12-01T10:00:00', '2025-12-01T12:00:00');

      // Vérifier disponibilité de 11h à 13h (chevauchement)
      const isAvailable = roomModel.isAvailable(
        roomId,
        '2025-12-01T11:00:00',
        '2025-12-01T13:00:00'
      );

      expect(isAvailable).toBe(false);
    });
  });
});
