import { Router } from 'express';
import { reservationController } from '../controllers/reservationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Toutes les routes de réservation nécessitent une authentification
router.use(authMiddleware);

router.post('/', reservationController.create);
router.get('/me', reservationController.getMyReservations);
router.get('/', reservationController.getAll);
router.delete('/:id', reservationController.delete);

export default router;
