import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/interfaces/user.interface';
import BaseController from './base.controller';
import CustomError from '../utils/CustumError';
import { sendError, sendSuccess } from '../utils/response.util';
import { RequestWithUser } from '../types/request-with-user';
import { userValidator } from '../models/validators/user.validator';

export default class UserController extends BaseController<IUser> {
  constructor() {
    super(User);
  }

  override create = async (req: Request, res: Response, next: NextFunction) => {
    
    try {

        const { error } = userValidator.validate(req.body);

        if (error) {
          sendError(res, 'Erreur de validation', 400, error.details[0].message);
          return;
        }

      const { phone } = req.body;
      const existingUser = await this.model.findOne({ phone });

      if (existingUser) {
         sendError(res, 'Utilisateur déjà créé', 400);
         return;
      }

      const newUser = await this.model.create({
        ...req.body,
        isActive: true,
      });

      sendSuccess(res, 'Utilisateur créé avec succès', newUser, 201);
    } catch (error) {
      sendError(res, 'Erreur lors de la création', 500, error);
    }
  };

  authentification = async (req: Request, res: Response, next: NextFunction) => {

    

    try {

      const { phone, password } = req.body;
      const existingUser = await this.model.findOne({ phone });

      

      if (!existingUser) {
        return sendError(res, 'Email ou mot de passe incorrect', 401);
      }

      if (!existingUser.isActive) {
        return sendError(res, 'Utilisateur bloqué', 403);
      }

      const isValid = await existingUser.comparePassword(password);
      if (!isValid) {
        return sendError(res, 'Téléphone ou mot de passe incorrect', 401);
      }

      await existingUser.generateToken();


      res.cookie('token', existingUser.token, {
        httpOnly: true,
        secure: process.env.MODE === 'prod',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      sendSuccess(res, 'Login réussi', existingUser, 200);

      
    } catch (err) {
      sendError(res, 'Erreur d’authentification', 500, err);
    }
  };

  getAuth = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const user = await this.model.findById(userId);
      if (!user || !user.isActive) {
        return next(new CustomError('Utilisateur inactif', 403));
      }
      sendSuccess(res, 'Données utilisateur', user, 200);
    } catch (error) {
      next(new CustomError('Erreur serveur', 500));
    }
  };

  updateCurrentUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      const updateData = { ...req.body, modifierId: userId };

      const updatedUser = await this.model.findByIdAndUpdate(userId, updateData, {
        new: true,
      });

      if (!updatedUser) {
        return next(new CustomError('Utilisateur non trouvé', 404));
      }

      sendSuccess(res, 'Mise à jour réussie', updatedUser, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la mise à jour', 500));
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {

    console.log("req.body");
    console.log(req.body);
    

    try {

      // Validation des données
      // const { error } = userValidator.validate(req.body);
      // console.log("error");
      // console.log(error);
      
      // if (error) {
      //   return sendError(res, 'Erreur de validation', 400, error.details[0].message);
      // }

      const { firstName, lastName, phone, password, role } = req.body;

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.model.findOne({ phone });

      if (existingUser) {
        return sendError(res, 'Cet email ou numéro de téléphone est déjà utilisé', 400);
      }

      // Créer le nouvel utilisateur
      const newUser = await this.model.create({
        firstName,
        lastName,
        phone,
        password, // Le hachage du mot de passe est géré par le modèle
        role,
        isActive: true,
      });

      // Générer un token pour l'utilisateur
      await newUser.generateToken();

      // Définir le cookie
      res.cookie('token', newUser.token, {
        httpOnly: true,
        secure: process.env.MODE === 'prod',
        maxAge: 24 * 60 * 60 * 1000 // 24 heures
      });

      // Retourner la réponse
      const userResponse = {
        ...newUser.toObject(),
        token: newUser.token // Inclure le token dans la réponse
      };
      delete userResponse.password; // Ne pas renvoyer le mot de passe

      sendSuccess(res, 'Inscription réussie', userResponse, 201);
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      sendError(res, 'Erreur lors de l\'inscription', 500, error);
    }
  };
}

