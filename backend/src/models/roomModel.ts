import db from '../config/database';
import { Room } from '../types';

export const roomModel = {
  findAll(): Room[] {
    const stmt = db.prepare('SELECT * FROM rooms ORDER BY name');
    return stmt.all() as Room[];
  },

  findById(id: number): Room | undefined {
    const stmt = db.prepare('SELECT * FROM rooms WHERE id = ?');
    return stmt.get(id) as Room | undefined;
  },

  create(name: string, capacity: number, equipment: string | null): Room {
    const stmt = db.prepare('INSERT INTO rooms (name, capacity, equipment) VALUES (?, ?, ?)');
    const result = stmt.run(name, capacity, equipment);
    return this.findById(result.lastInsertRowid as number)!;
  },

  isAvailable(roomId: number, startTime: string, endTime: string, excludeReservationId?: number): boolean {
    let query = `
      SELECT COUNT(*) as count FROM reservations
      WHERE room_id = ?
      AND ((start_time < ? AND end_time > ?) OR (start_time < ? AND end_time > ?) OR (start_time >= ? AND end_time <= ?))
    `;
    const params: (string | number)[] = [roomId, endTime, startTime, endTime, startTime, startTime, endTime];

    if (excludeReservationId) {
      query += ' AND id != ?';
      params.push(excludeReservationId);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count === 0;
  },

  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM rooms WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};
