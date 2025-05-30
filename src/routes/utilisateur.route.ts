import { Router } from 'express';
import UserController from '../controllers/utilisateur.controller';
import {  authMiddleware } from '../middlewares/auth.middleware'; // à adapter selon ton projet

const router = Router();
const controller = new  UserController();

// Routes CRUD de base
router.get('/', authMiddleware, controller.getAll);
router.get('/:id', authMiddleware, controller.getById);
router.post('/', authMiddleware, controller.create);
router.put('/:id', authMiddleware, controller.update);
router.delete('/:id', authMiddleware, controller.delete);

// Routes spécifiques
router.post('/login', controller.authentification);
router.post('/register', controller.register);
router.get('/auth/me', authMiddleware, controller.getAuth);

export default router;
