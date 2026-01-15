import { Request, Response } from "express";
import { roomModel } from "../models/roomModel";

export const roomController = {
	getAll(req: Request, res: Response): void {
		try {
			const rooms = roomModel.findAll();
			res.json(rooms);
		} catch (error) {
			res
				.status(500)
				.json({ error: "Erreur lors de la récupération des salles" });
		}
	},

	getById(req: Request, res: Response): void {
		try {
			const id = parseInt(req.params.id as string);
			const room = roomModel.findById(id);

			if (!room) {
				res.status(404).json({ error: "Salle non trouvée" });
				return;
			}

			res.json(room);
		} catch (error) {
			res
				.status(500)
				.json({ error: "Erreur lors de la récupération de la salle" });
		}
	},

	checkAvailability(req: Request, res: Response): void {
		try {
			const id = parseInt(req.params.id as string);
			const { startTime, endTime } = req.query;

			if (!startTime || !endTime) {
				res
					.status(400)
					.json({ error: "Les paramètres startTime et endTime sont requis" });
				return;
			}

			const room = roomModel.findById(id);
			if (!room) {
				res.status(404).json({ error: "Salle non trouvée" });
				return;
			}

			const isAvailable = roomModel.isAvailable(
				id,
				startTime as string,
				endTime as string
			);
			res.json({ roomId: id, isAvailable, startTime, endTime });
		} catch (error) {
			res
				.status(500)
				.json({ error: "Erreur lors de la vérification de disponibilité" });
		}
	},

  create(req: Request, res: Response): void {
    try {
      const { name, capacity, equipment } = req.body;

      if (!name || capacity === undefined || capacity === null) {
        res.status(400).json({ error: 'Le nom et la capacité sont requis' });
        return;
      }

      const capacityNum = typeof capacity === 'string' ? parseInt(capacity) : capacity;

      if (isNaN(capacityNum) || capacityNum <= 0) {
        res.status(400).json({ error: 'La capacité doit être un nombre supérieur à 0' });
        return;
      }

      const room = roomModel.create(name, capacityNum, equipment || null);
      res.status(201).json(room);
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la création de la salle' });
    }
  },

  delete(req: Request, res: Response): void {
    try {
      const id = parseInt(req.params.id);

      const room = roomModel.findById(id);
      if (!room) {
        res.status(404).json({ error: 'Salle non trouvée' });
        return;
      }

      roomModel.delete(id);
      res.json({ message: 'Salle supprimée avec succès' });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la suppression de la salle' });
    }
  }
};
