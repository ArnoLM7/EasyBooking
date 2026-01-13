import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel';

// Validation de l'email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validation du mot de passe (12+ caractères, majuscule, minuscule, chiffre, caractère spécial)
const isValidPassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 12) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins 12 caractères' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' };
  }
  return { valid: true, message: '' };
};

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      // Validation des champs requis
      if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, mot de passe et nom sont requis' });
        return;
      }

      // Validation de l'email
      if (!isValidEmail(email)) {
        res.status(400).json({ error: 'Format d\'email invalide' });
        return;
      }

      // Validation du mot de passe
      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        res.status(400).json({ error: passwordValidation.message });
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
  },

  logout(req: Request, res: Response): void {
    // Avec JWT, la déconnexion se fait côté client en supprimant le token
    // Cette route sert principalement à confirmer la déconnexion au frontend
    res.json({ message: 'Déconnexion réussie' });
  }
};
