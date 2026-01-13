import { Router } from "express";
import { roomController } from "../controllers/roomController";

const router = Router();

router.get("/", roomController.getAll);
router.get("/:id", roomController.getById);
router.get("/:id/availability", roomController.checkAvailability);

export default router;
