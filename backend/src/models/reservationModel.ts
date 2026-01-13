import db from '../config/database';
import { Reservation, ReservationWithDetails } from '../types';

export const reservationModel = {
  findById(id: number): Reservation | undefined {
    const stmt = db.prepare('SELECT * FROM reservations WHERE id = ?');
    return stmt.get(id) as Reservation | undefined;
  },

  findByUserId(userId: number): ReservationWithDetails[] {
    const stmt = db.prepare(`
      SELECT r.*, rooms.name as room_name
      FROM reservations r
      JOIN rooms ON r.room_id = rooms.id
      WHERE r.user_id = ?
      ORDER BY r.start_time DESC
    `);
    return stmt.all(userId) as ReservationWithDetails[];
  },

  findByRoomId(roomId: number): Reservation[] {
    const stmt = db.prepare('SELECT * FROM reservations WHERE room_id = ? ORDER BY start_time');
    return stmt.all(roomId) as Reservation[];
  },

  findAll(): ReservationWithDetails[] {
    const stmt = db.prepare(`
      SELECT r.*, rooms.name as room_name, users.name as user_name
      FROM reservations r
      JOIN rooms ON r.room_id = rooms.id
      JOIN users ON r.user_id = users.id
      ORDER BY r.start_time DESC
    `);
    return stmt.all() as ReservationWithDetails[];
  },

  create(userId: number, roomId: number, startTime: string, endTime: string): Reservation {
    const stmt = db.prepare(
      'INSERT INTO reservations (user_id, room_id, start_time, end_time) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(userId, roomId, startTime, endTime);
    return this.findById(result.lastInsertRowid as number)!;
  },

  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM reservations WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  },

  belongsToUser(reservationId: number, userId: number): boolean {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM reservations WHERE id = ? AND user_id = ?');
    const result = stmt.get(reservationId, userId) as { count: number };
    return result.count > 0;
  }
};
