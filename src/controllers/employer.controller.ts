import { Request, Response, NextFunction } from "express";
import Employer, { IEmployer } from "../models/interfaces/employer.interface";
import BaseController from "./base.controller";
import { sendError, sendSuccess } from "../utils/response.util";
import { employerValidator } from "../models/validators/employer.validator";
import { downloadDriveImage } from "../utils/download-file-drive";

export default class EmployerController extends BaseController<IEmployer> {
  
  constructor() {
    super(Employer);
  }

  override create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validation des données
      const { error } = employerValidator.validate(req.body);
      if (error) {
        sendError(res, 'Erreur de validation', 400, error.details[0].message);
        return;
      }

      console.log("req.body", req.body);
      
      // Vérifier si l'employé existe déjà
      const { phone } = req.body;
      const existingEmployer = await this.model.findOne({ phone });
      if (existingEmployer) {
        sendError(res, "Employé déjà créé", 400, "Employé déjà créé");
        return;
      }
      
      // Préparer l'URL de base pour les images
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      
      // Créer une copie des données pour modification
      const employerData = { ...req.body };

      // Traiter l'image Google Drive si elle existe
      if (employerData.photo && employerData.photo.includes('drive.google.com')) {
        try {
          console.log("Téléchargement de l'image depuis Google Drive:", employerData.photo);
          
          // Appeler la fonction de téléchargement
          const imageResult = await downloadDriveImage(employerData.photo, baseUrl);
          
          // Si le téléchargement a réussi, mettre à jour l'URL de la photo
          if (imageResult.success && imageResult.url) {
            console.log("Image téléchargée avec succès:", imageResult.url);
            employerData.photo = baseUrl + imageResult.url;
          } else {
            console.error("Échec du téléchargement de l'image:", imageResult.error);
            // Continuer sans modifier l'URL (optionnel)
          }
        } catch (imageError) {
          console.error("Erreur lors du traitement de l'image:", imageError);
          // Continuer sans modifier l'URL (optionnel)
        }
      }

      // Créer l'employé avec les données mises à jour (y compris la nouvelle URL de l'image)
      const newEmployer = await this.model.create(employerData);

      sendSuccess(res, 'Employé créé avec succès', newEmployer, 201);
      return;
    } catch (error) {
      sendError(res, 'Erreur lors de la création de l\'employer', 500, error);
      return;
    }
  }
}