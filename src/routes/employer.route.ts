import { Router } from "express";

import EmployerController from "../controllers/employer.controller";

import { authMiddleware } from "../middlewares/auth.middleware"; // à adapter selon ton projet

const router = Router();
const controller = new EmployerController();

// Routes CRUD de base
router.get("/", controller.getAll); 
router.get("/:id", controller.getById);
router.post("/", controller.create);
router.put("/:id", authMiddleware, controller.update);  
router.delete("/:id", authMiddleware, controller.delete);

export default router;