import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/userModel';

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

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

      if (!email || !password || !name) {
        res.status(400).json({ error: 'Email, mot de passe et nom sont requis' });
        return;
      }

      if (!isValidEmail(email)) {
        res.status(400).json({ error: 'Format d\'email invalide' });
        return;
      }

      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        res.status(400).json({ error: passwordValidation.message });
        return;
      }

      const existingUser = userModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({ error: 'Cet email est déjà utilisé' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = userModel.create(email, hashedPassword, name);

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

      if (!email || !password) {
        res.status(400).json({ error: 'Email et mot de passe sont requis' });
        return;
      }

      const user = userModel.findByEmail(email);
      if (!user) {
        res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        return;
      }

      const isValidPwd = await bcrypt.compare(password, user.password);
      if (!isValidPwd) {
        res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        return;
      }

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
    res.json({ message: 'Déconnexion réussie' });
  },

  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { name, email } = req.body;

      if (!name || !email) {
        res.status(400).json({ error: 'Le nom et l\'email sont requis' });
        return;
      }

      const existingUser = userModel.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        res.status(409).json({ error: 'Cet email est déjà utilisé par un autre utilisateur' });
        return;
      }

      const updatedUser = userModel.update(userId, name, email);
      if (!updatedUser) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
        return;
      }

      res.json({
        message: 'Profil mis à jour avec succès',
        user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
    }
  },

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      const deleted = userModel.delete(userId);
      if (!deleted) {
        res.status(404).json({ error: 'Utilisateur non trouvé' });
        return;
      }

      res.json({ message: 'Compte supprimé avec succès' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression du compte' });
    }
  }
};
