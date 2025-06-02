import { Request, Response, NextFunction } from 'express';
import BaseController from './base.controller';
import ReservationModel, { IReservation } from '../models/interfaces/reservation.interface';
import { reservationValidator, updateReservationStatusValidator } from '../models/validators/reservation.validator';
import CustomError from '../utils/CustumError';
import { sendSuccess, sendError } from '../utils/response.util';
import { DateTime } from 'luxon';
import { RequestWithUser } from '../types/request-with-user';
import mongoose from 'mongoose';

export default class ReservationController extends BaseController<IReservation> {
  constructor() {
    super(ReservationModel);
  }

  // Override create method to add reservation validation
  create = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Données de réservation reçues:', req.body);
      
      // Copier toutes les données pour la validation
      const reservationData = { ...req.body };
      
      // Si l'utilisateur est authentifié, associer son ID à la réservation
      if (req.user && req.user._id) {
        reservationData.userId = req.user._id.toString();
      }
      
      // Transférer les informations client vers les champs clientName, clientEmail, clientPhone
      if (reservationData.name && !reservationData.clientName) {
        reservationData.clientName = reservationData.name;
      }
      
      if (reservationData.email && !reservationData.clientEmail) {
        reservationData.clientEmail = reservationData.email;
      }
      
      if (reservationData.phone && !reservationData.clientPhone) {
        reservationData.clientPhone = reservationData.phone;
      }
      
      // Ajouter les informations supplémentaires de l'employé si elles sont présentes
      if (reservationData.employerInfo) {
        console.log('Informations supplémentaires de l\'employé reçues:', reservationData.employerInfo);
      }
      
      // Vérifier que les champs obligatoires sont présents
      if (!reservationData.startDate) {
        sendError(res, 'La date de début est requise', 400);
        return;
      }
      
      if (!reservationData.address) {
        sendError(res, 'L\'adresse est requise', 400);
        return;
      }
      
      if (!reservationData.amount && reservationData.amount !== 0) {
        reservationData.amount = 5000; // Montant par défaut si non spécifié
      }
      
      // Définir le statut par défaut si non spécifié
      if (!reservationData.status) {
        reservationData.status = 'PENDING';
      }
      
      // Validate reservation data
      const { error, value } = reservationValidator.validate(reservationData);
      if (error) {
        console.error('Erreur de validation:', error.details);
        sendError(res, `Erreur de validation: ${error.details[0].message}`, 400);
        return;
      }

      // Create reservation record with all information
      const reservation = await this.model.create({
        ...value,
        createdAt: DateTime.now().setZone('Africa/Dakar').toJSDate()
      });
      
      console.log('Réservation créée avec les informations client:', {
        id: reservation.id,
        clientName: reservationData.clientName || reservationData.name,
        clientEmail: reservationData.clientEmail || reservationData.email,
        clientPhone: reservationData.clientPhone || reservationData.phone,
        userId: reservationData.userId || 'Non connecté'
      });
      
      sendSuccess(res, 'Réservation créée avec succès', reservation, 201);
      return;
    } catch (error: any) {
      console.error('Reservation creation error:', error);
      // Envoyer une réponse d'erreur plus détaillée
      if (error.name === 'ValidationError') {
        sendError(res, 'Erreur de validation des données', 400, error.message);
      } else if (error.code === 11000) {
        sendError(res, 'Une réservation similaire existe déjà', 400);
      } else {
        sendError(res, 'Erreur lors de la création de la réservation', 500, error.message);
      }
      return;
    }
  };

  // Update reservation status
  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { error, value } = updateReservationStatusValidator.validate(req.body);
      
      if (error) {
        return next(new CustomError(error.details[0].message, 400));
      }

      const reservation = await this.model.findByIdAndUpdate(
        id,
        { 
          status: value.status,
          updatedAt: DateTime.now().setZone('Africa/Dakar').toJSDate()
        },
        { new: true }
      ).populate('userId', 'firstName lastName email phone')
        .populate({
          path: 'employerId',
          select: 'firstName lastName speciality image phone email address description',
          model: 'Employer'
        })
        .populate('serviceId', 'name description price');

      if (!reservation) {
        return next(new CustomError('Réservation introuvable', 404));
      }

      sendSuccess(res, 'Statut de réservation mis à jour avec succès', reservation, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la mise à jour du statut de réservation', 500));
    }
  };

  // Get reservation by ID
  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const reservation = await this.model.findById(id)
        .populate('userId', 'firstName lastName email phone')
        .populate({
          path: 'employerId',
          select: 'firstName lastName speciality image phone email address description',
          model: 'Employer'
        })
        .populate('serviceId', 'name description price');

      if (!reservation) {
        return next(new CustomError('Réservation non trouvée', 404));
      }

      console.log(`Réservation ${id} récupérée avec succès`);
      if (reservation.employerId) {
        console.log(`Employé associé: ${JSON.stringify(reservation.employerId)}`);
      }

      sendSuccess(res, 'Réservation récupérée avec succès', reservation, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la récupération de la réservation', 500));
    }
  };

  // Get reservations by user ID
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
      
      // If not admin and trying to access another user's reservations, restrict access
      if (req.user && req.user.role !== 'admin' && userId !== req.user._id.toString()) {
        return next(new CustomError('Non autorisé à accéder aux réservations d\'un autre utilisateur', 403));
      }
      
      const reservations = await this.model.find({ userId })
        .sort({ createdAt: -1 })
        .populate('userId', 'firstName lastName email phone')
        .populate({
          path: 'employerId',
          select: 'firstName lastName speciality image phone email address description',
          model: 'Employer'
        })
        .populate('serviceId', 'name description price');
        
      console.log(`${reservations.length} réservations trouvées pour l'utilisateur ${userId}`);
      
      sendSuccess(res, 'Réservations récupérées avec succès', reservations, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la récupération des réservations', 500));
    }
  };
  
  // Get all reservations with optional filters
  getAll = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      // Get userId from authenticated user if not admin
      let query: any = {};
      
      // If user is not admin, restrict to their own reservations
      // if (req.user && req.user.role !== 'admin') {
      //   query.userId = req.user._id.toString();
      // } 
      // If admin and userId query param is provided, filter by that userId
      if (req.query.userId) {
        query.userId = req.query.userId as string;
      }
      
      // Add status filter if provided
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      // Add date range filter if provided
      if (req.query.startDate) {
        query.startDate = { $gte: new Date(req.query.startDate as string) };
      }
      
      if (req.query.endDate) {
        query.endDate = { $lte: new Date(req.query.endDate as string) };
      }
      
      console.log("Requête de filtre:", query);
      
      // Exécuter la requête avec population des références
      const reservations = await this.model.find(query)
        .sort({ createdAt: -1 })
        .populate('userId', 'firstName lastName email phone')
        .populate({
          path: 'employerId',
          select: 'firstName lastName speciality image phone email address description',
          model: 'Employer'
        })
        .populate('serviceId', 'name description price');
        
      // Vérifier si des réservations ont été trouvées
      console.log(`${reservations.length} réservations trouvées`);
      
      // Vérifier si les employés ont été correctement populatés
      const employersPopulated = reservations.filter(r => r.employerId).length;
      console.log(`${employersPopulated} réservations avec employés populatés`);
        
      sendSuccess(res, 'Réservations récupérées avec succès', reservations, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la récupération des réservations', 500));
    }
  };
  
  // Get reservations by employer ID
  getByEmployerId = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const { employerId } = req.params;
      
      if (!employerId) {
        return next(new CustomError('ID employé requis', 400));
      }
      
      // Build query with employerId
      const query: any = { employerId };
      
      // Add status filter if provided
      if (req.query.status) {
        query.status = req.query.status;
      }
      
      const reservations = await this.model.find(query)
        .sort({ createdAt: -1 })
        .populate('userId', 'firstName lastName email phone')
        .populate({
          path: 'employerId',
          select: 'firstName lastName speciality image phone email address description',
          model: 'Employer'
        })
        .populate('serviceId', 'name description price');
      
      console.log(`${reservations.length} réservations trouvées pour l'employé ${employerId}`);
        
      sendSuccess(res, 'Réservations récupérées avec succès', reservations, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la récupération des réservations', 500));
    }
  };
  
  // Get dashboard statistics
  getDashboardStats = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
      if (!req.user || !req.user._id) {
        return next(new CustomError('Utilisateur non authentifié', 401));
      }
      
      // Build query based on user role
      let query: any = {};
      if (req.user.role !== 'admin') {
        query.userId = req.user._id;
      }
      
      // Get total count of reservations
      const totalReservations = await this.model.countDocuments(query);
      
      // Get count by status
      const pendingReservations = await this.model.countDocuments({
        ...query,
        status: 'PENDING'
      });
      
      const confirmedReservations = await this.model.countDocuments({
        ...query,
        status: 'CONFIRMED'
      });
      
      const completedReservations = await this.model.countDocuments({
        ...query,
        status: 'COMPLETED'
      });
      
      const cancelledReservations = await this.model.countDocuments({
        ...query,
        status: 'CANCELLED'
      });
      
      // Get recent reservations
      const recentReservations = await this.model.find(query)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'firstName lastName email phone')
        .populate({
          path: 'employerId',
          select: 'firstName lastName speciality image phone email address description',
          model: 'Employer'
        })
        .populate('serviceId', 'name description price');
      
      // Get total amount of completed reservations
      const totalAmount = await this.model.aggregate([
        { $match: { ...query, status: 'COMPLETED' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      
      // Get reservations by month (for the last 6 months)
      const sixMonthsAgo = DateTime.now().minus({ months: 6 }).toJSDate();
      
      const reservationsByMonth = await this.model.aggregate([
        { 
          $match: { 
            ...query, 
            createdAt: { $gte: sixMonthsAgo } 
          } 
        },
        {
          $group: {
            _id: { 
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            amount: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);
      
      // Format the response
      const stats = {
        totalReservations,
        byStatus: {
          pending: pendingReservations,
          confirmed: confirmedReservations,
          completed: completedReservations,
          cancelled: cancelledReservations
        },
        recentReservations,
        totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
        byMonth: reservationsByMonth.map(item => ({
          year: item._id.year,
          month: item._id.month,
          count: item.count,
          amount: item.amount
        }))
      };
      
      console.log(`Statistiques du dashboard générées avec ${recentReservations.length} réservations récentes`);
      
      sendSuccess(res, 'Statistiques récupérées avec succès', stats, 200);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      next(new CustomError('Erreur lors de la récupération des statistiques', 500));
    }
  };

  // Méthode pour suivre une réservation sans authentification
  trackReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Récupérer l'ID et l'email depuis les paramètres de requête
      const { id, email } = req.query;
      
      // Vérifier que les paramètres requis sont présents
      if (!id || !email) {
        sendError(res, 'L\'ID de réservation et l\'email sont requis', 400);
        return;
      }

      console.log(`Tentative de suivi de réservation - ID: ${id}, Email: ${email}`);
      
      // Rechercher la réservation par ID
      const reservation = await this.model.findById(id)
        .populate('userId', 'firstName lastName email phone')
        .populate({
          path: 'employerId',
          select: 'firstName lastName speciality image phone email address description',
          model: 'Employer'
        })
        .populate('serviceId', 'name description price');
      
      // Vérifier si la réservation existe
      if (!reservation) {
        sendError(res, 'Réservation non trouvée', 404);
        return;
      }
      
      // Vérifier que l'email correspond à celui de la réservation
      const reservationEmail = reservation.clientEmail || 
                              (reservation.userId && reservation.userId.email) || 
                              '';
      
      if (reservationEmail.toLowerCase() !== String(email).toLowerCase()) {
        sendError(res, 'Les informations fournies ne correspondent pas à cette réservation', 403);
        return;
      }
      
      console.log(`Réservation trouvée pour le suivi - ID: ${id}, Statut: ${reservation.status}`);
      
      // Renvoyer les détails de la réservation
      sendSuccess(res, 'Détails de la réservation récupérés avec succès', reservation, 200);
    } catch (error: any) {
      console.error('Erreur lors du suivi de réservation:', error);
      if (error.name === 'CastError') {
        sendError(res, 'ID de réservation invalide', 400);
      } else {
        next(new CustomError('Erreur lors de la récupération des détails de la réservation', 500));
      }
    }
  };
}
