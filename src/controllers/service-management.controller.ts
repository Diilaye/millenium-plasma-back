import { Request, Response, NextFunction } from 'express';

import BaseController from "./base.controller";
import ServiceManagement ,{ IServiceManagement } from '../models/interfaces/service-management.interface';
import { sendError, sendSuccess } from '../utils/response.util';
import { serviceManagementValidator } from '../models/validators/service-management.validator';

export default class ServiceManagementController extends BaseController<IServiceManagement> {
    // Define the model type
    constructor() {
        super(ServiceManagement);   
    }

    override create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { error } = serviceManagementValidator.validate(req.body);

            if (error) { 
                sendError(res, 'Erreur de validation', 400, error.details[0].message);
                return;
            }

            const { phone } = req.body;
            const existingServiceManagement = await this.model.findOne({ phone });

            if (existingServiceManagement) {
                sendError(res, "Demande utilisateur déjà créée", 400, "Demande utilisateur déjà créée" );
                return;
            }

            const newServiceManagement = await this.model.create({
                ...req.body,
                isTreat: false,
            });
             sendSuccess(res, 'Utilisateur créé avec succès', newServiceManagement, 201);
            return;
        } catch (error) {
            sendError(res, 'Erreur lors de la création de la demande utilisateur', 500, error);
                 return;
        }
    }
}