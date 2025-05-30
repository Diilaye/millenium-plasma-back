import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { sendError, sendSuccess } from '../utils/response.util';
import Employer from '../models/interfaces/employer.interface';
import { RequestWithUser } from '../types/request-with-user';

// Étendre la définition de Request pour inclure les fichiers de multer
declare global {
  namespace Express {
    // Add Multer namespace to Express
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
    interface Request {
      files: {
        [fieldname: string]: Express.Multer.File[];
      };
    }
  }
}

// Configuration de stockage pour multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isProd = process.env.NODE_ENV === 'production';
    const uploadDir = isProd
      ? path.join(__dirname,'..','..', '/dist/uploads')
      : path.join(__dirname,'..','..','/uploads');
    
    //const uploadDir = path.join(__dirname,'..','..','/uploads');

    console.log("uploadDir");
    console.log(uploadDir);
    

    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accepter les images, PDF et documents
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 
    'application/pdf',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
    return new Error('Type de fichier non pris en charge');
  }
};

// Initialiser l'upload avec multer
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10 MB
});

export default class UploadController {
  
  // Middleware pour gérer l'upload de plusieurs fichiers
  uploadMiddleware = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
    { name: 'certification0', maxCount: 1 },
    { name: 'certification1', maxCount: 1 },
    { name: 'certification2', maxCount: 1 },
    { name: 'certification3', maxCount: 1 },
    { name: 'certification4', maxCount: 1 }
  ]);
  
  // Méthode pour uploader une image sans authentification
  uploadImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Vérifier si des fichiers ont été uploadés
      if (!req.files || !req.files.photo || req.files.photo.length === 0) {
        return sendError(res, 'Aucune image n\'a été uploadée', 400);
      }
      
      // Récupérer le fichier image
      const imageFile = req.files.photo[0];
      
      // Construire l'URL de l'image
      const imageUrl = `/uploads/${imageFile.filename}`;
      
      // Retourner l'URL de l'image
      sendSuccess(res, 'Image uploadée avec succès', { url: imageUrl }, 200);
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      sendError(res, 'Erreur lors de l\'upload de l\'image', 500, error);
    }
  };
  
  // Méthode pour uploader les documents d'un employeur
  uploadEmployerDocuments = async (req: RequestWithUser & Request, res: Response, next: NextFunction) => {
    try {
      // Vérifier si l'utilisateur est authentifié
      if (!req.user) {
        return sendError(res, 'Utilisateur non authentifié', 401);
      }
      
      // Récupérer l'ID de l'employeur depuis le corps de la requête
      const { employerId } = req.body;
      
      if (!employerId) {
        return sendError(res, 'ID de l\'employeur manquant', 400);
      }
      
      // Vérifier si des fichiers ont été uploadés
      if (!req.files) {
        return sendError(res, 'Aucun fichier n\'a été uploadé', 400);
      }
      
      // Récupérer l'employeur
      const employer = await Employer.findById(employerId);
      
      if (!employer) {
        return sendError(res, 'Employeur non trouvé', 404);
      }
      
      // Vérifier si l'utilisateur a le droit de modifier cet employeur
      // On autorise l'utilisateur qui vient de s'inscrire ou un admin
      if (req.user.role !== 'Admin' && req.user.role !== 'housekeeper') {
        return sendError(res, 'Vous n\'êtes pas autorisé à modifier cet employeur', 403);
      }
      
      // Traiter les fichiers uploadés
      const files = req.files;
      const updatedFields: any = {};
      
      // Traiter la photo de profil
      if (files.photo && files.photo.length > 0) {
        updatedFields.photo = `/uploads/${files.photo[0].filename}`;
      }
      
      // Traiter le CV
      if (files.cv && files.cv.length > 0) {
        updatedFields.cv = `/uploads/${files.cv[0].filename}`;
      }
      
      // Traiter les certifications
      const certifications: string[] = [];
      
      for (let i = 0; i < 5; i++) {
        const certField = `certification${i}`;
        if (files[certField] && files[certField].length > 0) {
          certifications.push(`/uploads/${files[certField][0].filename}`);
        }
      }
      
      if (certifications.length > 0) {
        updatedFields.certifications = certifications;
      }
      
      // Ajouter l'ID de l'utilisateur à l'employeur s'il n'est pas déjà défini
      if (!employer.userId) {
        updatedFields.userId = req.user.id;
      }
      
      // Mettre à jour l'employeur avec les chemins des fichiers
      const updatedEmployer = await Employer.findByIdAndUpdate(
        employerId,
        { $set: updatedFields },
        { new: true }
      );
      
      sendSuccess(res, 'Documents uploadés avec succès', updatedEmployer, 200);
    } catch (error) {
      console.error('Erreur lors de l\'upload des documents:', error);
      sendError(res, 'Erreur lors de l\'upload des documents', 500, error);
    }
  };
}
