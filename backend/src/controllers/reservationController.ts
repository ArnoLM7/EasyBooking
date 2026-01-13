import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { reservationModel } from '../models/reservationModel';
import { roomModel } from '../models/roomModel';

export const reservationController = {
  create(req: AuthenticatedRequest, res: Response): void {
    try {
      const { roomId, startTime, endTime } = req.body;
      const userId = req.user!.userId;

      // Validation
      if (!roomId || !startTime || !endTime) {
        res.status(400).json({ error: 'roomId, startTime et endTime sont requis' });
        return;
      }

      // Vérifier que la salle existe
      const room = roomModel.findById(roomId);
      if (!room) {
        res.status(404).json({ error: 'Salle non trouvée' });
        return;
      }

      // Vérifier la disponibilité
      const isAvailable = roomModel.isAvailable(roomId, startTime, endTime);
      if (!isAvailable) {
        res.status(409).json({ error: 'Cette salle est déjà réservée pour ce créneau' });
        return;
      }

      // Créer la réservation
      const reservation = reservationModel.create(userId, roomId, startTime, endTime);
      res.status(201).json({
        message: 'Réservation créée avec succès',
        reservation
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création de la réservation' });
    }
  },

  getMyReservations(req: AuthenticatedRequest, res: Response): void {
    try {
      const userId = req.user!.userId;
      const reservations = reservationModel.findByUserId(userId);
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des réservations' });
    }
  },

  getAll(req: AuthenticatedRequest, res: Response): void {
    try {
      const reservations = reservationModel.findAll();
      res.json(reservations);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des réservations' });
    }
  },

  delete(req: AuthenticatedRequest, res: Response): void {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user!.userId;

      // Vérifier que la réservation existe
      const reservation = reservationModel.findById(id);
      if (!reservation) {
        res.status(404).json({ error: 'Réservation non trouvée' });
        return;
      }

      // Vérifier que la réservation appartient à l'utilisateur
      if (!reservationModel.belongsToUser(id, userId)) {
        res.status(403).json({ error: 'Vous ne pouvez supprimer que vos propres réservations' });
        return;
      }

      reservationModel.delete(id);
      res.json({ message: 'Réservation supprimée avec succès' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression de la réservation' });
    }
  }
};
