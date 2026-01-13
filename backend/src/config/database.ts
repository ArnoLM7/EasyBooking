import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dbPath =
	process.env.NODE_ENV === "test"
		? ":memory:"
		: path.join(__dirname, "../../data/easybooking.db");

// Créer le dossier data s'il n'existe pas (sauf en mode test avec :memory:)
if (process.env.NODE_ENV !== "test") {
	const dataDir = path.dirname(dbPath);
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
}

const db: Database.Database = new Database(dbPath);

// Activer les clés étrangères
db.pragma("foreign_keys = ON");

export const initDatabase = (): void => {
	// Table des utilisateurs
	db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

	// Table des salles
	db.exec(`
    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      equipment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

	// Table des réservations
	db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )
  `);

	// Insérer des salles par défaut si la table est vide
	const roomCount = db.prepare("SELECT COUNT(*) as count FROM rooms").get() as {
		count: number;
	};
	if (roomCount.count === 0) {
		const insertRoom = db.prepare(
			"INSERT INTO rooms (name, capacity, equipment) VALUES (?, ?, ?)"
		);
		insertRoom.run("Salle A", 10, "Projecteur, Tableau blanc");
		insertRoom.run("Salle B", 20, "Projecteur, Visioconférence");
		insertRoom.run("Salle C", 5, "Tableau blanc");
		insertRoom.run("Salle D", 15, "Projecteur, Tableau blanc, Visioconférence");
	}
};

export default db;
