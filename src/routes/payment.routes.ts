import { Router } from 'express';
import PaymentController from '../controllers/payment.controller';
import { generatePaymentRedirect } from '../middlewares/payment-redirect.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const paymentController = new PaymentController();

// Base CRUD routes
router.get('/', authMiddleware, paymentController.getAll);
router.get('/:id', authMiddleware, paymentController.getById);
router.post('/', authMiddleware, paymentController.create);
router.put('/:id', authMiddleware, paymentController.update);
router.delete('/:id', authMiddleware, paymentController.delete);

// Custom payment routes
router.get('/user/:userId', authMiddleware, paymentController.getByUserId);
router.put('/:id/status', authMiddleware, paymentController.updateStatus);
router.get('/verify/:reference', paymentController.verifyPayment);
router.post('/callback', paymentController.processCallback);

// Traitement des paiements de réservation (accessible sans authentification)
router.post('/process', paymentController.processReservationPayment);

// Payment initiation with redirect
router.post('/initiate', authMiddleware, generatePaymentRedirect, (req: any, res) => {
  if (req.redirectUrl) {
    res.status(200).json({ 
      success: true, 
      message: 'URL de paiement générée avec succès', 
      data: { redirectUrl: req.redirectUrl } 
    });
  } else {
    res.status(400).json({ 
      success: false, 
      message: 'Échec de génération de l\'URL de paiement' 
    });
  }
});

export default router;
