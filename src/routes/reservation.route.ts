import express from 'express';
import ReservationController from '../controllers/reservation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();
const reservationController = new ReservationController();

// Route pour créer une nouvelle réservation (accessible sans authentification)
router.post('/', reservationController.create);

// Route pour obtenir toutes les réservations (avec filtres optionnels)
router.get('/', authMiddleware, reservationController.getAll);

// Route pour obtenir les statistiques du dashboard
router.get('/dashboard', authMiddleware, reservationController.getDashboardStats);

// Route pour obtenir les réservations d'un utilisateur spécifique
router.get('/user/:userId', authMiddleware, reservationController.getByUserId);

// Route pour obtenir les réservations d'un employé spécifique
router.get('/employer/:employerId', authMiddleware, reservationController.getByEmployerId);

// Route pour obtenir une réservation spécifique par ID
router.get('/:id', authMiddleware, reservationController.getById);

// Route pour mettre à jour le statut d'une réservation
router.patch('/:id/status', authMiddleware, reservationController.updateStatus);

// Route pour mettre à jour une réservation
router.put('/:id', authMiddleware, reservationController.update);

// Route pour supprimer une réservation
router.delete('/:id', authMiddleware, reservationController.delete);

export default router;
