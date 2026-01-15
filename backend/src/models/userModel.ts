import db from '../config/database';
import { User } from '../types';

export const userModel = {
  findByEmail(email: string): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as User | undefined;
  },

  findById(id: number): User | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as User | undefined;
  },

  create(email: string, password: string, name: string): User {
    const stmt = db.prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)');
    const result = stmt.run(email, password, name);
    return this.findById(result.lastInsertRowid as number)!;
  },

  findAll(): User[] {
    const stmt = db.prepare('SELECT id, email, name, created_at FROM users');
    return stmt.all() as User[];
  },

  update(id: number, name: string, email: string): User | undefined {
    const stmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
    stmt.run(name, email, id);
    return this.findById(id);
  },

  updatePassword(id: number, password: string): boolean {
    const stmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
    const result = stmt.run(password, id);
    return result.changes > 0;
  },

  delete(id: number): boolean {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};
