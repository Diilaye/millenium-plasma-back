import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Interface pour la réponse de la fonction de téléchargement
 */
interface DriveDownloadResult {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

/**
 * Télécharge une image depuis Google Drive et retourne l'URL locale
 * @param driveUrl - URL Google Drive de l'image
 * @param baseUrl - URL de base pour construire l'URL complète (ex: http://localhost:3031)
 * @param uploadDir - Dossier où sauvegarder les images (chemin absolu)
 * @returns Promise avec le résultat du téléchargement
 */
export async function downloadDriveImage(
  driveUrl: string,
  baseUrl: string,
  uploadDir?: string
): Promise<DriveDownloadResult> {
  // Déterminer si nous sommes en production ou en développement
  const isProd = process.env.NODE_ENV === 'production';
  
  // Définir le chemin du dossier d'upload en fonction de l'environnement
  if (!uploadDir) {
    uploadDir = isProd
      ? path.join(process.cwd(), '/dist/uploads')
      : path.join(process.cwd(), '/src/uploads');
  }
  
  console.log(`Environnement: ${isProd ? 'production' : 'développement'}`);
  console.log(`Dossier d'upload: ${uploadDir}`);
  
  try {
    // Vérifier l'URL
    if (!driveUrl) {
      return { 
        success: false, 
        error: 'URL Google Drive requise' 
      };
    }
    
    // S'assurer que le dossier d'upload existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Extraire l'ID du fichier de l'URL Google Drive
    let fileId = '';
    
    if (driveUrl.includes('/file/d/')) {
      // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
      fileId = driveUrl.split('/file/d/')[1].split('/')[0];
    } else if (driveUrl.includes('id=')) {
      // Format: https://drive.google.com/open?id=FILE_ID
      fileId = driveUrl.split('id=')[1].split('&')[0];
    } else {
      return { 
        success: false, 
        error: 'Format d\'URL Google Drive non reconnu' 
      };
    }
    
    console.log('ID du fichier Google Drive extrait:', fileId);
    
    // Construire l'URL de téléchargement direct
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    // Générer un nom de fichier unique (UUID + timestamp)
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const fileName = `drive-image-${timestamp}-${uniqueId}.jpg`;
    const filePath = path.join(uploadDir, fileName);
    
    console.log('Téléchargement de l\'image depuis:', directUrl);
    console.log('Sauvegarde vers:', filePath);
    
    // Télécharger l'image
    try {
      const response = await axios({
        method: 'GET',
        url: directUrl,
        responseType: 'stream',
        timeout: 10000 // 10 secondes de timeout
      });
      
      // Créer un stream pour sauvegarder l'image
      const writer = fs.createWriteStream(filePath);
      
      // Pipe la réponse dans le fichier
      response.data.pipe(writer);
      
      // Attendre que le fichier soit complètement écrit
      await new Promise<void>((resolve, reject) => {
        writer.on('finish', () => {
          console.log('Fichier sauvegardé avec succès');
          resolve();
        });
        writer.on('error', (error: Error) => {
          console.error('Erreur lors de l\'écriture du fichier:', error);
          reject(error);
        });
      });
      
      // Construire l'URL pour accéder à l'image
      const imageUrl = `${baseUrl}/uploads/${fileName}`;
      
      return {
        success: true,
        url: imageUrl,
        fileName
      };
    } catch (downloadError) {
      console.error('Erreur lors du téléchargement:', downloadError);
      
      // Essayer une autre approche si la première échoue
      try {
        console.log('Tentative avec une URL alternative');
        const alternativeUrl = `https://drive.usercontent.google.com/download?id=${fileId}`;
        
        const response = await axios({
          method: 'GET',
          url: alternativeUrl,
          responseType: 'stream',
          timeout: 10000
        });
        
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        
        await new Promise<void>((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });
        
        const imageUrl = `${baseUrl}/uploads/${fileName}`;
        
        return {
          success: true,
          url: imageUrl,
          fileName
        };
      } catch (secondError) {
        console.error('Échec de la deuxième tentative:', secondError);
        return { 
          success: false, 
          error: 'Échec du téléchargement de l\'image après plusieurs tentatives'
        };
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur globale lors du téléchargement de l\'image:', error);
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
}