import { Request, Response, NextFunction } from 'express';
import BaseController from './base.controller';
import PaymentModel from '../models/interfaces/payment.interface';
import { paymentValidator, updatePaymentStatusValidator } from '../models/validators/payment.validator';
import CustomError from '../utils/CustumError';
import { sendSuccess, sendError } from '../utils/response.util';
import { v4 as uuidv4 } from 'uuid';
import { DateTime } from 'luxon';
import { RequestWithUser } from '../types/request-with-user';
import { generatePaymentLink } from '../utils/payment.util';

interface PaymentRequestBody {
  userId: string;
  amount: number;
  currency?: string;
  method: 'OM' | 'WAVE' | 'CARD' | 'BANK_TRANSFER';
  reference?: string;
  metadata?: Record<string, any>;
}

interface CustomRequest extends RequestWithUser {
  body: PaymentRequestBody;
  redirectUrl?: string;
  tokenOM?: string;
}

export default class PaymentController extends BaseController<typeof PaymentModel> {
  constructor() {
    super(PaymentModel);
  }

  // Override create method to add payment validation
  create = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      // Get userId from authenticated user
      if (!req.user || !req.user._id) {
        return next(new CustomError('Utilisateur non authentifié', 401));
      }
      
      // Set userId from authenticated user
      req.body.userId = req.user._id.toString();
      
      // Set default payment method to WAVE if not provided
      if (!req.body.method) {
        req.body.method = 'WAVE';
      }
      
      // Validate payment data
      const { error, value } = paymentValidator.validate(req.body);
      if (error) {
        return next(new CustomError(error.details[0].message, 400));
      }

      // Generate unique reference if not provided
      if (!value.reference) {
        value.reference = `PAY-${uuidv4().substring(0, 8)}-${DateTime.now().toFormat('yyyyMMddHHmmss')}`;
      }

      // Create payment record with userId
      const payment = await this.model.create({
        ...value,
        status: 'PENDING', // Ensure default status
        createdAt: DateTime.now().setZone('Africa/Dakar').toJSDate()
      });
      
      // Generate payment link based on method
      try {
        if (value.type === 'payment_link' || value.method === 'WAVE' || value.method === 'OM') {
          const paymentLink = await generatePaymentLink(
            value.method as 'WAVE' | 'OM',
            value.amount,
            value.reference,
            value.client
          );
          
          // Update payment with the payment link
          await this.model.findByIdAndUpdate(
            payment.id,
            { paymentLink },
            { new: true }
          );
          
          // Return the payment with the payment link
          sendSuccess(res, 'Paiement initié avec succès', { ...payment.toObject(), paymentLink }, 201);
        } else {
          sendSuccess(res, 'Paiement initié avec succès', payment, 201);
        }
      } catch (linkError) {
        console.error('Payment link generation error:', linkError);
        // Still return the payment even if link generation fails
        sendSuccess(res, 'Paiement créé mais erreur lors de la génération du lien', payment, 201);
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      next(new CustomError('Erreur lors de l\'initialisation du paiement', 500));
    }
  };

  // Process reservation payment
  processReservationPayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reservationId, amount, paymentMethod, phoneNumber, cardDetails } = req.body;
      
      console.log('Traitement du paiement pour la réservation:', reservationId);
      console.log('Données de paiement reçues:', { amount, paymentMethod, phoneNumber: phoneNumber ? '******' + phoneNumber.slice(-4) : null });
      
      if (!reservationId) {
        return sendError(res, 'ID de réservation requis', 400);
      }
      
      if (!amount) {
        return sendError(res, 'Montant requis', 400);
      }
      
      if (!paymentMethod) {
        return sendError(res, 'Méthode de paiement requise', 400);
      }
      
      // Vérifier si la réservation existe
      const ReservationModel = require('../models/interfaces/reservation.interface').default;
      const reservation = await ReservationModel.findById(reservationId);
      
      if (!reservation) {
        return sendError(res, 'Réservation introuvable', 404);
      }
      
      // Convertir la méthode de paiement au format attendu par le modèle
      let method: 'OM' | 'WAVE' | 'CARD' | 'BANK_TRANSFER' = 'WAVE';
      
      switch (paymentMethod) {
        case 'mobile_money':
          method = 'WAVE';
          break;
        case 'card':
          method = 'CARD';
          break;
        case 'bank_transfer':
          method = 'BANK_TRANSFER';
          break;
      }
      
      // Générer une référence unique
      const reference = `RES-${reservationId.substring(0, 8)}-${DateTime.now().toFormat('yyyyMMddHHmmss')}`;
      
      // Créer l'enregistrement de paiement
      const paymentData: any = {
        amount,
        method,
        reference,
        currency: 'XOF',
        // Ne pas inclure le status ici, il sera ajouté automatiquement par défaut
        metadata: {
          reservationId,
          ...(phoneNumber && { phoneNumber }),
          ...(cardDetails && { cardDetails }),
          paymentMethod
        }
      };
      
      // Ajouter l'ID utilisateur si l'utilisateur est authentifié
      if ((req as RequestWithUser).user && (req as RequestWithUser).user._id) {
        paymentData.userId = (req as RequestWithUser).user._id.toString();
      }
      
      // Valider les données de paiement
      const { error, value } = paymentValidator.validate(paymentData);
      
      if (error) {
        console.error('Erreur de validation du paiement:', error.details);
        return sendError(res, `Erreur de validation: ${error.details[0].message}`, 400);
      }
      
      // Ajouter des champs par défaut si nécessaire
      if (!value.client) {
        value.client = `client-${reservationId}`;
      }
      
      if (!value.type) {
        value.type = 'payment';
      }
      
      // Créer l'enregistrement de paiement
      const payment = await this.model.create({
        ...value,
        createdAt: DateTime.now().setZone('Africa/Dakar').toJSDate()
      });
      
      // Générer un lien de paiement en fonction de la méthode
      try {
        // Déterminer la méthode de paiement pour la génération du lien
        const paymentMethod = method === 'CARD' ? 'WAVE' : method;
        
        // Générer le lien de paiement
        const paymentLink = await generatePaymentLink(
          paymentMethod as 'WAVE' | 'OM',
          amount,
          reference,
          value.client || 'Client'
        );
        
        // Mettre à jour le paiement avec le lien
        const updatedPayment = await this.model.findByIdAndUpdate(
          payment.id,
          { paymentLink, updatedAt: DateTime.now().setZone('Africa/Dakar').toJSDate() },
          { new: true }
        );
        
        // Mettre à jour le statut de la réservation à PENDING_PAYMENT
        await ReservationModel.findByIdAndUpdate(
          reservationId,
          { 
            status: 'PENDING', 
            paymentId: payment.id,
            updatedAt: DateTime.now().setZone('Africa/Dakar').toJSDate() 
          },
          { new: true }
        );
        
        // Retourner le paiement avec le lien de paiement
        sendSuccess(res, 'Lien de paiement généré avec succès', { ...updatedPayment.toObject(), paymentLink }, 200);
      } catch (linkError) {
        console.error('Erreur de génération du lien de paiement:', linkError);
        sendError(res, 'Erreur lors de la génération du lien de paiement', 500);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      sendError(res, 'Erreur lors du traitement du paiement', 500);
    }
  };

  // Update payment status
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { error, value } = updatePaymentStatusValidator.validate(req.body);
      
      if (error) {
        return next(new CustomError(error.details[0].message, 400));
      }

      const payment = await this.model.findByIdAndUpdate(
        id,
        { 
          status: value.status,
          transactionId: value.transactionId,
          updatedAt: DateTime.now().setZone('Africa/Dakar').toJSDate()
        },
        { new: true }
      );

      if (!payment) {
        return next(new CustomError('Paiement introuvable', 404));
      }

      sendSuccess(res, 'Statut de paiement mis à jour avec succès', payment, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la mise à jour du statut de paiement', 500));
    }
  };

  // Get payments by user ID
  getByUserId = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      // Get userId from params or from authenticated user
      let userId = req.params.userId;
      
      // If no userId in params, use authenticated user's ID
      if (!userId && req.user) {
        userId = req.user._id.toString();
      }
      
      if (!userId) {
        return next(new CustomError('ID utilisateur requis', 400));
      }
      
      // If not admin and trying to access another user's payments, restrict access
      if (req.user && req.user.role !== 'admin' && userId !== req.user._id.toString()) {
        return next(new CustomError('Non autorisé à accéder aux paiements d\'un autre utilisateur', 403));
      }
      
      const payments = await this.model.find({ userId }).sort({ createdAt: -1 });
      sendSuccess(res, 'Paiements récupérés avec succès', payments, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la récupération des paiements', 500));
    }
  };
  
  // Get all payments with optional userId filter in query params
  getAll = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      // Get userId from authenticated user if not admin
      let query = {};
      
      // If user is not admin, restrict to their own payments
      if (req.user && req.user.role !== 'admin') {
        query = { userId: req.user._id.toString() };
      } 
      // If admin and userId query param is provided, filter by that userId
      else if (req.query.userId) {
        query = { userId: req.query.userId as string };
      }
      
      const payments = await this.model.find(query).sort({ createdAt: -1 });
      sendSuccess(res, 'Paiements récupérés avec succès', payments, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la récupération des paiements', 500));
    }
  };

  // Verify payment status
  verifyPayment = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { reference } = req.params;
      
      // Build query with reference
      const query: any = { reference };
      
      // If not admin, restrict to user's own payments
      if (req.user && req.user.role !== 'admin') {
        query.userId = req.user._id.toString();
      }
      // If admin and userId query param is provided, filter by that userId
      else if (req.query.userId) {
        query.userId = req.query.userId as string;
      }
      
      const payment = await this.model.findOne(query);
      
      if (!payment) {
        return next(new CustomError('Référence de paiement invalide', 404));
      }

      sendSuccess(res, 'Statut de paiement vérifié', payment, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la vérification du paiement', 500));
    }
  };

  // Process callback from payment provider
  processCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reference, status, transactionId } = req.body;
      
      if (!reference || !status) {
        return next(new CustomError('Paramètres manquants dans la requête de callback', 400));
      }

      const payment = await this.model.findOne({ reference });

      console.log('Payment found:', payment);
      
      if (!payment) {
        return next(new CustomError('Référence de paiement invalide', 404));
      }

      payment.status = status;
      if (transactionId) payment.transactionId = transactionId;
      payment.updatedAt = DateTime.now().setZone('Africa/Dakar').toJSDate();
      
      await payment.save();

      sendSuccess(res, 'Callback traité avec succès', payment, 200);
    } catch (error) {
      next(new CustomError('Erreur lors du traitement du callback', 500));
    }
  };

  successWave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reference } = req.query;

    
      
      if (!reference) {
        return res.redirect('https://millenium-placement.sn/?status=error&message=Paramètres manquants');
      }
  
      const payment = await this.model.findOne({ reference });
  
      console.log('Payment found:', payment);

      console.log('Payment found metadata:', payment.metadata?.reservationId);
      
      if (!payment) {
        return res.redirect('https://millenium-placement.sn/?status=error&message=Référence de paiement invalide');
      }
  
      payment.status = "COMPLETED";
      if (payment.metadata?.reservationId) payment.transactionId = payment.metadata.reservationId;
      payment.updatedAt = DateTime.now().setZone('Africa/Dakar').toJSDate();
      
      await payment.save();
  
      // Rediriger vers la page d'accueil avec un message de succès
      return res.redirect('https://millenium-placement.sn/?status=success&message=Paiement effectué avec succès');
    } catch (error) {
      console.error('Erreur lors du traitement du callback:', error);
      return res.redirect('https://millenium-placement.sn/?status=error&message=Erreur lors du traitement du paiement');
    }
  };
  
  errorWave = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reference } = req.query;
      
      if (!reference) {
        return res.redirect('https://millenium-placement.sn/?status=error&message=Paramètres manquants');
      }
  
      const payment = await this.model.findOne({ reference });
  
      console.log('Payment found:', payment);
      
      if (!payment) {
        return res.redirect('https://millenium-placement.sn/?status=error&message=Reference de paiement invalide');
      }
  
      payment.status = "FAILED";
      payment.updatedAt = DateTime.now().setZone('Africa/Dakar').toJSDate();
      
      await payment.save();
  
      // Rediriger vers la page d'accueil avec un message d'erreur
      return res.redirect('https://millenium-placement.sn/?status=error&message=Le paiement a echoué');
    } catch (error) {
      console.error('Erreur lors du traitement du callback d\'erreur:', error);
      return res.redirect('https://millenium-placement.sn/?status=error&message=Erreur lors du traitement du paiement');
    }
  };
  
}
