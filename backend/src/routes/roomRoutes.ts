import { Router } from "express";
import { roomController } from "../controllers/roomController";

const router = Router();

router.get("/", roomController.getAll);
router.post("/", roomController.create);
router.get("/:id/availability", roomController.checkAvailability);
router.get("/:id", roomController.getById);
router.delete("/:id", roomController.delete);

export default router;
