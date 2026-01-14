import request from "supertest";
import app from "../../src/app";
import { initDatabase } from "../../src/config/database";
import db from "../../src/config/database";

describe("Reservations Integration Tests", () => {
	let authToken: string;
	let userId: number;

	const validUser = {
		email: "test@example.com",
		password: "Password123!@#",
		name: "Test User",
	};

	beforeEach(async () => {
		// Réinitialiser la base de données avant chaque test
		// Drop et recréer les tables pour réinitialiser les IDs auto-incrémentés
		db.exec("DROP TABLE IF EXISTS reservations");
		db.exec("DROP TABLE IF EXISTS users");
		db.exec("DROP TABLE IF EXISTS rooms");
		initDatabase();

		// Créer un utilisateur et récupérer le token
		const registerResponse = await request(app)
			.post("/api/auth/register")
			.send(validUser);
		authToken = registerResponse.body.token;
		userId = registerResponse.body.user.id;
	});

	describe("POST /api/reservations", () => {
		const validReservation = {
			roomId: 1,
			startTime: "2026-01-15T10:00:00",
			endTime: "2026-01-15T11:00:00",
		};

		it("devrait créer une réservation avec des données valides", async () => {
			const response = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send(validReservation);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty(
				"message",
				"Réservation créée avec succès"
			);
			expect(response.body.reservation).toHaveProperty("id");
			expect(response.body.reservation).toHaveProperty("user_id", userId);
			expect(response.body.reservation).toHaveProperty(
				"room_id",
				validReservation.roomId
			);
			expect(response.body.reservation).toHaveProperty(
				"start_time",
				validReservation.startTime
			);
			expect(response.body.reservation).toHaveProperty(
				"end_time",
				validReservation.endTime
			);
		});

		it("devrait retourner 401 sans token", async () => {
			const response = await request(app)
				.post("/api/reservations")
				.send(validReservation);

			expect(response.status).toBe(401);
		});

		it("devrait retourner 401 avec un token invalide", async () => {
			const response = await request(app)
				.post("/api/reservations")
				.set("Authorization", "Bearer invalid_token")
				.send(validReservation);

			expect(response.status).toBe(401);
		});

		it("devrait retourner 400 si roomId manquant", async () => {
			const response = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					startTime: validReservation.startTime,
					endTime: validReservation.endTime,
				});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"roomId, startTime et endTime sont requis"
			);
		});

		it("devrait retourner 400 si startTime manquant", async () => {
			const response = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					roomId: validReservation.roomId,
					endTime: validReservation.endTime,
				});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"roomId, startTime et endTime sont requis"
			);
		});

		it("devrait retourner 400 si endTime manquant", async () => {
			const response = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					roomId: validReservation.roomId,
					startTime: validReservation.startTime,
				});

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"roomId, startTime et endTime sont requis"
			);
		});

		it("devrait retourner 404 pour une salle inexistante", async () => {
			const response = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ ...validReservation, roomId: 999 });

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty("error", "Salle non trouvée");
		});

		it("devrait retourner 409 pour un créneau déjà réservé", async () => {
			// Première réservation
			await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send(validReservation);

			// Deuxième réservation sur le même créneau
			const response = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send(validReservation);

			expect(response.status).toBe(409);
			expect(response.body).toHaveProperty(
				"error",
				"Cette salle est déjà réservée pour ce créneau"
			);
		});

		it("devrait permettre des réservations sur des créneaux différents", async () => {
			// Première réservation
			await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send(validReservation);

			// Deuxième réservation sur un autre créneau
			const response = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					roomId: 1,
					startTime: "2026-01-15T14:00:00",
					endTime: "2026-01-15T15:00:00",
				});

			expect(response.status).toBe(201);
		});

		it("devrait permettre des réservations sur des salles différentes au même créneau", async () => {
			// Réservation salle 1
			await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send(validReservation);

			// Réservation salle 2 au même créneau
			const response = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({ ...validReservation, roomId: 2 });

			expect(response.status).toBe(201);
		});
	});

	describe("GET /api/reservations/me", () => {
		it("devrait retourner les réservations de l'utilisateur connecté", async () => {
			// Créer une réservation
			await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					roomId: 1,
					startTime: "2026-01-15T10:00:00",
					endTime: "2026-01-15T11:00:00",
				});

			const response = await request(app)
				.get("/api/reservations/me")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(1);
			expect(response.body[0]).toHaveProperty("user_id", userId);
		});

		it("devrait retourner un tableau vide si aucune réservation", async () => {
			const response = await request(app)
				.get("/api/reservations/me")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(0);
		});

		it("devrait retourner 401 sans token", async () => {
			const response = await request(app).get("/api/reservations/me");

			expect(response.status).toBe(401);
		});

		it("devrait ne pas voir les réservations des autres utilisateurs", async () => {
			// Créer une réservation avec l'utilisateur actuel
			await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					roomId: 1,
					startTime: "2026-01-15T10:00:00",
					endTime: "2026-01-15T11:00:00",
				});

			// Créer un autre utilisateur
			const otherUserResponse = await request(app)
				.post("/api/auth/register")
				.send({
					email: "other@example.com",
					password: "Password123!@#",
					name: "Other User",
				});
			const otherToken = otherUserResponse.body.token;

			// Vérifier que l'autre utilisateur ne voit pas la réservation
			const response = await request(app)
				.get("/api/reservations/me")
				.set("Authorization", `Bearer ${otherToken}`);

			expect(response.status).toBe(200);
			expect(response.body.length).toBe(0);
		});
	});

	describe("GET /api/reservations", () => {
		it("devrait retourner toutes les réservations", async () => {
			// Créer plusieurs réservations
			await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					roomId: 1,
					startTime: "2026-01-15T10:00:00",
					endTime: "2026-01-15T11:00:00",
				});

			await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					roomId: 2,
					startTime: "2026-01-15T14:00:00",
					endTime: "2026-01-15T15:00:00",
				});

			const response = await request(app)
				.get("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
			expect(response.body.length).toBe(2);
		});

		it("devrait retourner 401 sans token", async () => {
			const response = await request(app).get("/api/reservations");

			expect(response.status).toBe(401);
		});
	});

	describe("DELETE /api/reservations/:id", () => {
		it("devrait supprimer sa propre réservation", async () => {
			// Créer une réservation
			const createResponse = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					roomId: 1,
					startTime: "2026-01-15T10:00:00",
					endTime: "2026-01-15T11:00:00",
				});
			expect(createResponse.status).toBe(201);
			const reservationId = createResponse.body.reservation.id;

			const response = await request(app)
				.delete(`/api/reservations/${reservationId}`)
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty(
				"message",
				"Réservation supprimée avec succès"
			);

			// Vérifier que la réservation n'existe plus
			const getResponse = await request(app)
				.get("/api/reservations/me")
				.set("Authorization", `Bearer ${authToken}`);
			expect(getResponse.body.length).toBe(0);
		});

		it("devrait retourner 401 sans token", async () => {
			// Créer une réservation d'abord
			const createResponse = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					roomId: 1,
					startTime: "2026-01-15T10:00:00",
					endTime: "2026-01-15T11:00:00",
				});
			expect(createResponse.status).toBe(201);
			const reservationId = createResponse.body.reservation.id;

			const response = await request(app).delete(
				`/api/reservations/${reservationId}`
			);

			expect(response.status).toBe(401);
		});

		it("devrait retourner 404 pour une réservation inexistante", async () => {
			const response = await request(app)
				.delete("/api/reservations/999")
				.set("Authorization", `Bearer ${authToken}`);

			expect(response.status).toBe(404);
			expect(response.body).toHaveProperty("error", "Réservation non trouvée");
		});

		it("devrait retourner 403 pour supprimer la réservation d'un autre utilisateur", async () => {
			// Créer une réservation avec l'utilisateur principal
			const createResponse = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					roomId: 1,
					startTime: "2026-01-15T10:00:00",
					endTime: "2026-01-15T11:00:00",
				});
			expect(createResponse.status).toBe(201);
			const reservationId = createResponse.body.reservation.id;

			// Créer un autre utilisateur
			const otherUserResponse = await request(app)
				.post("/api/auth/register")
				.send({
					email: "other@example.com",
					password: "Password123!@#",
					name: "Other User",
				});
			const otherToken = otherUserResponse.body.token;

			// Tenter de supprimer la réservation de l'autre utilisateur
			const response = await request(app)
				.delete(`/api/reservations/${reservationId}`)
				.set("Authorization", `Bearer ${otherToken}`);

			expect(response.status).toBe(403);
			expect(response.body).toHaveProperty(
				"error",
				"Vous ne pouvez supprimer que vos propres réservations"
			);
		});
	});

	describe("Workflow complet", () => {
		it("devrait gérer le workflow complet: inscription, login, réservation, consultation, suppression", async () => {
			const newUser = {
				email: "workflow@example.com",
				password: "WorkflowPass123!",
				name: "Workflow User",
			};

			// 1. Inscription
			const registerResponse = await request(app)
				.post("/api/auth/register")
				.send(newUser);
			expect(registerResponse.status).toBe(201);
			const token = registerResponse.body.token;

			// 2. Vérifier disponibilité d'une salle
			const availabilityResponse = await request(app).get(
				"/api/rooms/1/availability?startTime=2026-01-16T09:00:00&endTime=2026-01-16T10:00:00"
			);
			expect(availabilityResponse.status).toBe(200);
			expect(availabilityResponse.body.isAvailable).toBe(true);

			// 3. Créer une réservation
			const createResponse = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${token}`)
				.send({
					roomId: 1,
					startTime: "2026-01-16T09:00:00",
					endTime: "2026-01-16T10:00:00",
				});
			expect(createResponse.status).toBe(201);
			const reservationId = createResponse.body.reservation.id;

			// 4. Vérifier que la salle n'est plus disponible
			const unavailableResponse = await request(app).get(
				"/api/rooms/1/availability?startTime=2026-01-16T09:00:00&endTime=2026-01-16T10:00:00"
			);
			expect(unavailableResponse.body.isAvailable).toBe(false);

			// 5. Consulter ses réservations
			const myReservationsResponse = await request(app)
				.get("/api/reservations/me")
				.set("Authorization", `Bearer ${token}`);
			expect(myReservationsResponse.body.length).toBe(1);

			// 6. Supprimer la réservation
			const deleteResponse = await request(app)
				.delete(`/api/reservations/${reservationId}`)
				.set("Authorization", `Bearer ${token}`);
			expect(deleteResponse.status).toBe(200);

			// 7. Vérifier que la salle est de nouveau disponible
			const availableAgainResponse = await request(app).get(
				"/api/rooms/1/availability?startTime=2026-01-16T09:00:00&endTime=2026-01-16T10:00:00"
			);
			expect(availableAgainResponse.body.isAvailable).toBe(true);
		});

		it("devrait gérer plusieurs utilisateurs réservant la même salle", async () => {
			// Utilisateur 1 crée une réservation
			const createResponse = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`)
				.send({
					roomId: 1,
					startTime: "2026-01-17T10:00:00",
					endTime: "2026-01-17T11:00:00",
				});
			expect(createResponse.status).toBe(201);

			// Utilisateur 2 s'inscrit
			const user2Response = await request(app)
				.post("/api/auth/register")
				.send({
					email: "user2@example.com",
					password: "Password123!@#",
					name: "User Two",
				});
			const user2Token = user2Response.body.token;

			// Utilisateur 2 tente de réserver le même créneau
			const conflictResponse = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${user2Token}`)
				.send({
					roomId: 1,
					startTime: "2026-01-17T10:00:00",
					endTime: "2026-01-17T11:00:00",
				});
			expect(conflictResponse.status).toBe(409);

			// Utilisateur 2 réserve un autre créneau
			const successResponse = await request(app)
				.post("/api/reservations")
				.set("Authorization", `Bearer ${user2Token}`)
				.send({
					roomId: 1,
					startTime: "2026-01-17T14:00:00",
					endTime: "2026-01-17T15:00:00",
				});
			expect(successResponse.status).toBe(201);

			// Vérifier que les deux réservations existent
			const allReservationsResponse = await request(app)
				.get("/api/reservations")
				.set("Authorization", `Bearer ${authToken}`);
			expect(allReservationsResponse.body.length).toBe(2);
		});
	});
});
