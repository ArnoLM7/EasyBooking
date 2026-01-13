import { Request, Response } from 'express';
import { roomModel } from '../models/roomModel';

export const roomController = {
  getAll(req: Request, res: Response): void {
    try {
      const rooms = roomModel.findAll();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération des salles' });
    }
  },

  getById(req: Request, res: Response): void {
    try {
      const id = parseInt(req.params.id);
      const room = roomModel.findById(id);

      if (!room) {
        res.status(404).json({ error: 'Salle non trouvée' });
        return;
      }

      res.json(room);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la récupération de la salle' });
    }
  },

  checkAvailability(req: Request, res: Response): void {
    try {
      const id = parseInt(req.params.id);
      const { startTime, endTime } = req.query;

      if (!startTime || !endTime) {
        res.status(400).json({ error: 'Les paramètres startTime et endTime sont requis' });
        return;
      }

      const room = roomModel.findById(id);
      if (!room) {
        res.status(404).json({ error: 'Salle non trouvée' });
        return;
      }

      const isAvailable = roomModel.isAvailable(id, startTime as string, endTime as string);
      res.json({ roomId: id, isAvailable, startTime, endTime });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la vérification de disponibilité' });
    }
  }
};
