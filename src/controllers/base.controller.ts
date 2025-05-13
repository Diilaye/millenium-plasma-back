import { Request, Response, NextFunction } from 'express';
import CustomError from '../utils/CustumError';
import { sendSuccess, sendError } from '../utils/response.util';

export default class BaseController<T> {
    
  model: any;

  constructor(model: any) {
    this.model = model;
  }

  getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const items = await this.model.find();
      sendSuccess(res, 'Liste récupérée avec succès', items, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la récupération', 500));
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.model.findById(req.params.id);
      if (!item) return next(new CustomError('Introuvable', 404));
      sendSuccess(res, 'Item trouvé', item, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la recherche', 500));
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
      const item = await this.model.create(req.body);
      sendSuccess(res, 'Création réussie', item, 201);
    } catch (error) {
      next(new CustomError('Erreur lors de la création', 500));
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.model.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!item) return next(new CustomError('Introuvable', 404));
      sendSuccess(res, 'Mise à jour réussie', item, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la mise à jour', 500));
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const item = await this.model.findByIdAndDelete(req.params.id);
      if (!item) return next(new CustomError('Introuvable', 404));
      sendSuccess(res, 'Suppression réussie', item, 200);
    } catch (error) {
      next(new CustomError('Erreur lors de la suppression', 500));
    }
  };
}
