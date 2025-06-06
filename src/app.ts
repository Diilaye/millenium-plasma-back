
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
import reviewsAdminRoute from "./routes/reviews-admin.route";
import reviewsClientRoute from "./routes/reviews-client.route";
import paymentRoute from "./routes/payment.routes";
import reservationRoute from "./routes/reservation.route";
import uploadRoute from "./routes/upload.route";

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



const allowedOrigins = ['http://localhost:3030' , 'https://millenium-plasma.nataal.shop', 'https://millenium-placement.sn'];

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


// Dossier pour stocker les images téléchargées
const isProd = process.env.NODE_ENV === 'production';
const uploadDir = isProd
  ? path.join(process.cwd(), '/dist/uploads')
  : path.join(__dirname, '/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
console.log(`Environnement: ${isProd ? 'production' : 'développement'}`);
console.log(`Dossier d'upload: ${uploadDir}`);

// Rendre le dossier uploads accessible
app.use('/uploads', express.static(uploadDir));


app.use("/api/v1/users",userRoute);

app.use("/api/v1/demande-users",demandeUserRoute);

app.use("/api/v1/service",serviceManagementRoute);

app.use("/api/v1/employers",employerRoute);

app.use("/api/v1/reviews-admin",reviewsAdminRoute);

app.use("/api/v1/reviews-client",reviewsClientRoute);

app.use("/api/v1/payments",paymentRoute);

app.use("/api/v1/reservations",reservationRoute);

app.use("/api/v1/upload",uploadRoute);


app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.use(errorHandler);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
