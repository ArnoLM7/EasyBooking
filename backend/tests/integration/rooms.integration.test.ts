import request from "supertest";
import app from "../../src/app";
import { initDatabase } from "../../src/config/database";
import db from "../../src/config/database";

describe("Rooms Integration Tests", () => {
	let authToken: string;

	beforeEach(async () => {
		// Réinitialiser la base de données avant chaque test
		// Drop et recréer les tables pour réinitialiser les IDs auto-incrémentés
		db.exec("DROP TABLE IF EXISTS reservations");
		db.exec("DROP TABLE IF EXISTS users");
		db.exec("DROP TABLE IF EXISTS rooms");
		initDatabase();

		// Créer un utilisateur et récupérer le token pour les tests nécessitant une authentification
		const registerResponse = await request(app)
			.post("/api/auth/register")
			.send({
				email: "test@example.com",
				password: "Password123!@#",
				name: "Test User",
			});
		authToken = registerResponse.body.token;
	});

	describe("GET /api/rooms", () => {
		it("devrait retourner la liste des salles", async () => {
			const response = await request(app).get("/api/rooms");

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(4); // 4 salles par défaut
		});

		it("devrait retourner les propriétés correctes pour chaque salle", async () => {
			const response = await request(app).get("/api/rooms");

			expect(response.status).toBe(200);
			const firstRoom = response.body[0];
			expect(firstRoom).toHaveProperty("id");
			expect(firstRoom).toHaveProperty("name");
			expect(firstRoom).toHaveProperty("capacity");
			expect(firstRoom).toHaveProperty("equipment");
		});

		it("devrait inclure les salles par défaut", async () => {
			const response = await request(app).get("/api/rooms");

			expect(response.status).toBe(200);
			const roomNames = response.body.map((room: { name: string }) => room.name);
			expect(roomNames).toContain("Salle A");
			expect(roomNames).toContain("Salle B");
			expect(roomNames).toContain("Salle C");
			expect(roomNames).toContain("Salle D");
		});
	});

	describe("GET /api/rooms/:id", () => {
		it("devrait retourner une salle spécifique par son ID", async () => {
			const response = await request(app).get("/api/rooms/1");

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("id", 1);
			expect(response.body).toHaveProperty("name", "Salle A");
			expect(response.body).toHaveProperty("capacity", 10);
			expect(response.body).toHaveProperty("equipment", "Projecteur, Tableau blanc");
		});

		it("devrait retourner 404 pour une salle inexistante", async () => {
			const response = await request(app).get("/api/rooms/999");

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty("error", "Salle non trouvée");
		});

		it("devrait gérer correctement les différentes salles", async () => {
			const salleB = await request(app).get("/api/rooms/2");
			expect(salleB.status).toBe(200);
			expect(salleB.body.name).toBe("Salle B");
			expect(salleB.body.capacity).toBe(20);

			const salleC = await request(app).get("/api/rooms/3");
			expect(salleC.status).toBe(200);
			expect(salleC.body.name).toBe("Salle C");
			expect(salleC.body.capacity).toBe(5);

			const salleD = await request(app).get("/api/rooms/4");
			expect(salleD.status).toBe(200);
			expect(salleD.body.name).toBe("Salle D");
			expect(salleD.body.capacity).toBe(15);
		});
	});

	describe("GET /api/rooms/:id/availability", () => {
		const startTime = "2026-01-15T10:00:00";
		const endTime = "2026-01-15T11:00:00";

		it("devrait retourner disponible pour une salle sans réservation", async () => {
			const response = await request(app).get(
				`/api/rooms/1/availability?startTime=${startTime}&endTime=${endTime}`
			);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("roomId", 1);
			expect(response.body).toHaveProperty("isAvailable", true);
			expect(response.body).toHaveProperty("startTime", startTime);
			expect(response.body).toHaveProperty("endTime", endTime);
		});

		it("devrait retourner indisponible après une réservation", async () => {
			// Créer une réservation
			await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ roomId: 1, startTime, endTime });

			// Vérifier la disponibilité
			const response = await request(app).get(
				`/api/rooms/1/availability?startTime=${startTime}&endTime=${endTime}`
			);

			expect(response.status).toBe(200);
			expect(response.body.isAvailable).toBe(false);
		});

		it("devrait retourner disponible pour un créneau différent", async () => {
			// Créer une réservation de 10h à 11h
			await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ roomId: 1, startTime, endTime });

			// Vérifier la disponibilité de 12h à 13h
			const response = await request(app).get(
				"/api/rooms/1/availability?startTime=2026-01-15T12:00:00&endTime=2026-01-15T13:00:00"
			);

			expect(response.status).toBe(200);
			expect(response.body.isAvailable).toBe(true);
		});

		it("devrait retourner indisponible pour un créneau qui chevauche partiellement", async () => {
			// Créer une réservation de 10h à 11h
			await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ roomId: 1, startTime, endTime });

			// Vérifier la disponibilité de 10h30 à 11h30 (chevauchement)
			const response = await request(app).get(
				"/api/rooms/1/availability?startTime=2026-01-15T10:30:00&endTime=2026-01-15T11:30:00"
			);

			expect(response.status).toBe(200);
			expect(response.body.isAvailable).toBe(false);
		});

		it("devrait retourner 400 si startTime manquant", async () => {
			const response = await request(app).get(
				`/api/rooms/1/availability?endTime=${endTime}`
			);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"Les paramètres startTime et endTime sont requis"
			);
		});

		it("devrait retourner 400 si endTime manquant", async () => {
			const response = await request(app).get(
				`/api/rooms/1/availability?startTime=${startTime}`
			);

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"Les paramètres startTime et endTime sont requis"
			);
		});

		it("devrait retourner 404 pour une salle inexistante", async () => {
			const response = await request(app).get(
				`/api/rooms/999/availability?startTime=${startTime}&endTime=${endTime}`
			);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty("error", "Salle non trouvée");
		});
	});
});
