import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
<<<<<<< HEAD
router.post('/logout', authMiddleware, authController.logout);
=======
router.put('/profile', authMiddleware, authController.updateProfile);
router.delete('/account', authMiddleware, authController.deleteAccount);
>>>>>>> f61ee60 (ajout de la gestion des salle et du profil, test de performznce avec autocannon)

export default router;
