
import express, { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import connectDB from "./configs/db";
import {errorHandler} from "./middlewares/errorHandler";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from 'cookie-parser';

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// import route 

import userRoute from "./routes/utilisateur.route";
import demandeUserRoute from "./routes/demande-user.route";
import  serviceManagementRoute  from './routes/service-management.route';
import employerRoute from "./routes/employer.route";

dotenv.config();

const app = express();

const port = process.env.PORT || 3000;

connectDB().then();

app.use(bodyParser.json({
  limit: '10000mb'
}));

app.use(bodyParser.urlencoded({
  extended: true,
  limit: '10000mb'
}));



const allowedOrigins = ['http://localhost:3030' , 'https://millenium-plasma.nataal.shop'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));




app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Interfaces
interface DriveRequestBody {
  driveUrl: string;
}

interface DriveResponseSuccess {
  success: true;
  fileName: string;
  fileId: string;
  path: string;
  url: string;
}

interface DriveResponseError {
  success: false;
  error: string;
}

type DriveResponse = DriveResponseSuccess | DriveResponseError;




// Dossier pour stocker les images téléchargées
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Rendre le dossier uploads accessible
app.use('/uploads', express.static(uploadDir));

// Route pour télécharger une image depuis Google Drive
app.post('/api/download-drive-image', async (req: Request<{}, {}, DriveRequestBody>, res: Response<DriveResponse>) => {
  try {
    const { driveUrl } = req.body;
    
    if (!driveUrl) {
      return res.status(400).json({ 
        success: false, 
        error: 'URL Google Drive requise' 
      });
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
      return res.status(400).json({ 
        success: false, 
        error: 'Format d\'URL Google Drive non reconnu' 
      });
    }
    
    // Construire l'URL de téléchargement direct
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    
    // Générer un nom de fichier unique (UUID + timestamp)
    const timestamp = Date.now();
    const uniqueId = uuidv4().substring(0, 8);
    const fileName = `drive-image-${timestamp}-${uniqueId}.jpg`;
    const filePath = path.join(uploadDir, fileName);
    
    // Télécharger l'image
    const response = await axios({
      method: 'GET',
      url: directUrl,
      responseType: 'stream'
    });
    
    // Créer un stream pour sauvegarder l'image
    const writer = fs.createWriteStream(filePath);
    
    // Pipe la réponse dans le fichier
    response.data.pipe(writer);
    
    // Attendre que le fichier soit complètement écrit
    await new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve());
      writer.on('error', (error: Error) => reject(error));
    });
    
    // Obtenir l'URL de base
    const protocol = req.protocol;
    const host = req.get('host');
    
    // Générer l'URL pour accéder à l'image
    const imageUrl = `${protocol}://${host}/uploads/${fileName}`;
    
    res.json({
      success: true,
      fileName,
      fileId,
      path: filePath,
      url: imageUrl
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors du téléchargement de l\'image:', error);
    
    res.status(500).json({ 
      success: false, 
      error: errorMessage || 'Erreur serveur lors du téléchargement de l\'image'
    });
  }
});



app.use("/api/v1/users",userRoute);

app.use("/api/v1/demande-users",demandeUserRoute);

app.use("/api/v1/service",serviceManagementRoute);

app.use("/api/v1/employers",employerRoute);


app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.use(errorHandler);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
