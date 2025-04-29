import { Request, Response, NextFunction } from 'express';

import BaseController from "./base.controller";
import DemandeUser, { IDemandeUser } from '../models/interfaces/demande.user.interace';
import { demandeUserValidator } from '../models/validators/demande-user.validator';
import { sendError, sendSuccess } from '../utils/response.util';


export default class DemandeUserController extends BaseController<IDemandeUser>{

    constructor() {
        super(DemandeUser);
    }

    override create = async (req: Request, res: Response, next: NextFunction) => {

        try {

            const { error } = demandeUserValidator.validate(req.body);

            if (error) { 
                 sendError(res, 'Erreur de validation', 400, error.details[0].message);
                 return;
            }

            const { phone } = req.body;
            const existingDemandeUser = await this.model.findOne({ phone });

            if (existingDemandeUser) {

                sendError(res, "Demande utilisateur déjà créée", 400, "Demande utilisateur déjà créée" );
                return;
            }

            const newDemandeUser = await this.model.create({
                ...req.body,
                isTreat: false,
            });
             sendSuccess(res, 'Utilisateur créé avec succès', newDemandeUser, 201);
            return;
        } catch (error) {
            sendError(res, 'Erreur lors de la création de la demande utilisateur', 500, error);
                 return;
        }
    };



    
}
   