import request from "supertest";
import app from "../../src/app";
import { initDatabase } from "../../src/config/database";
import db from "../../src/config/database";

describe("Auth Integration Tests", () => {
	beforeEach(() => {
		// Réinitialiser la base de données avant chaque test
		db.exec("DELETE FROM reservations");
		db.exec("DELETE FROM users");
		db.exec("DELETE FROM rooms");
		initDatabase();
	});

	describe("POST /api/auth/register", () => {
		const validUser = {
			email: "test@example.com",
			password: "Password123!@#",
			name: "Test User",
		};

		it("devrait créer un nouvel utilisateur avec des données valides", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send(validUser);

			expect(response.status).toBe(201);
			expect(response.body).toHaveProperty(
				"message",
				"Utilisateur créé avec succès"
			);
			expect(response.body).toHaveProperty("token");
			expect(response.body.user).toHaveProperty("email", validUser.email);
			expect(response.body.user).toHaveProperty("name", validUser.name);
			expect(response.body.user).not.toHaveProperty("password");
		});

		it("devrait retourner 400 si email manquant", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({ password: validUser.password, name: validUser.name });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("error");
		});

		it("devrait retourner 400 si password manquant", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({ email: validUser.email, name: validUser.name });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("error");
		});

		it("devrait retourner 400 si name manquant", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({ email: validUser.email, password: validUser.password });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("error");
		});

		it("devrait retourner 400 pour un email invalide", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({ ...validUser, email: "invalid-email" });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty("error", "Format d'email invalide");
		});

		it("devrait retourner 400 pour un mot de passe trop court", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({ ...validUser, password: "Short1!" });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"Le mot de passe doit contenir au moins 12 caractères"
			);
		});

		it("devrait retourner 400 pour un mot de passe sans majuscule", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({ ...validUser, password: "password123!@#" });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"Le mot de passe doit contenir au moins une majuscule"
			);
		});

		it("devrait retourner 400 pour un mot de passe sans minuscule", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({ ...validUser, password: "PASSWORD123!@#" });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"Le mot de passe doit contenir au moins une minuscule"
			);
		});

		it("devrait retourner 400 pour un mot de passe sans chiffre", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({ ...validUser, password: "PasswordABC!@#" });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"Le mot de passe doit contenir au moins un chiffre"
			);
		});

		it("devrait retourner 400 pour un mot de passe sans caractère spécial", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({ ...validUser, password: "Password12345" });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"Le mot de passe doit contenir au moins un caractère spécial"
			);
		});

		it("devrait retourner 409 si email déjà utilisé", async () => {
			// Premier enregistrement
			await request(app).post("/api/auth/register").send(validUser);

			// Deuxième enregistrement avec le même email
			const response = await request(app)
				.post("/api/auth/register")
				.send(validUser);

			expect(response.status).toBe(409);
			expect(response.body).toHaveProperty(
				"error",
				"Cet email est déjà utilisé"
			);
		});
	});

	describe("POST /api/auth/login", () => {
		const validUser = {
			email: "test@example.com",
			password: "Password123!@#",
			name: "Test User",
		};

		beforeEach(async () => {
			// Créer un utilisateur pour les tests de login
			await request(app).post("/api/auth/register").send(validUser);
		});

		it("devrait connecter un utilisateur avec des identifiants valides", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: validUser.email, password: validUser.password });

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("message", "Connexion réussie");
			expect(response.body).toHaveProperty("token");
			expect(response.body.user).toHaveProperty("email", validUser.email);
			expect(response.body.user).toHaveProperty("name", validUser.name);
		});

		it("devrait retourner 400 si email manquant", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ password: validUser.password });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"Email et mot de passe sont requis"
			);
		});

		it("devrait retourner 400 si password manquant", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: validUser.email });

			expect(response.status).toBe(400);
			expect(response.body).toHaveProperty(
				"error",
				"Email et mot de passe sont requis"
			);
		});

		it("devrait retourner 401 pour un email incorrect", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "wrong@example.com", password: validUser.password });

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty(
				"error",
				"Email ou mot de passe incorrect"
			);
		});

		it("devrait retourner 401 pour un mot de passe incorrect", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: validUser.email, password: "WrongPassword123!" });

			expect(response.status).toBe(401);
			expect(response.body).toHaveProperty(
				"error",
				"Email ou mot de passe incorrect"
			);
		});
	});

	describe("POST /api/auth/logout", () => {
		it("devrait retourner un message de succès", async () => {
			const response = await request(app).post("/api/auth/logout");

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("message", "Déconnexion réussie");
		});
	});

	describe("GET /api/health", () => {
		it("devrait retourner le statut de santé", async () => {
			const response = await request(app).get("/api/health");

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty("status", "OK");
			expect(response.body).toHaveProperty("timestamp");
		});
	});
});
