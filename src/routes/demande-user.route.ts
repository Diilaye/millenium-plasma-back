import { Router } from 'express';
import DemandeUserController from '../controllers/demande-user.controller';
import {  authMiddleware } from '../middlewares/auth.middleware'; // à adapter selon ton projet

const router = Router();
const controller = new  DemandeUserController();

// Routes CRUD de base
router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getById);
router.post('/',controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

export default router;
