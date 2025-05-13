import { Router } from 'express';
import ReviewClientController from '../controllers/reviews-client.controller';
import {  authMiddleware } from '../middlewares/auth.middleware'; // à adapter selon ton projet

const router = Router();
const controller = new  ReviewClientController();

// Routes CRUD de base
router.get('/', controller.getAll);
router.get('/:id', authMiddleware, controller.getById);
router.post('/',controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

export default router;
