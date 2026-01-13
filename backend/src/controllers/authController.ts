import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel';

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // Validation
      if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, mot de passe et nom sont requis' });
        return;
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = userModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'Cet email est déjà utilisé' });
        return;
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);

      // Créer l'utilisateur
      const user = userModel.create(email, hashedPassword, name);

      // Générer le token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: { id: user.id, email: user.email, name: user.name },
        token
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création du compte' });
    }
  },

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        res.status(400).json({ error: 'Email et mot de passe sont requis' });
        return;
      }

      // Trouver l'utilisateur
      const user = userModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        return;
      }

      // Vérifier le mot de passe
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        return;
      }

      // Générer le token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Connexion réussie',
        user: { id: user.id, email: user.email, name: user.name },
        token
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
  }
};
