import { Router } from 'express';
import UploadController from '../controllers/upload.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new UploadController();

// Route pour uploader les documents d'un employeur
router.post('/employer-documents', 
  authMiddleware, 
  controller.uploadMiddleware,
  controller.uploadEmployerDocuments
);

// Route pour uploader une image sans authentification
router.post('/image', 
  controller.uploadMiddleware,
  controller.uploadImage
);

export default router;
