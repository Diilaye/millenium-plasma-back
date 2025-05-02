import express from 'express';
import * as dotenv from 'dotenv';
import connectDB from "./configs/db";
import {errorHandler} from "./middlewares/errorHandler";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from 'cookie-parser';

// import route 

import userRoute from "./routes/utilisateur.route";
import demandeUserRoute from "./routes/demande-user.route";
import  serviceManagementRoute  from './routes/service-management.route';

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

// app.use(cors({
//     origin: ['http://localhost:3030' , 'https://millenium-plasma.nataal.shop/'],
//     credentials: true
//   }
// ));

app.use(cors());

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});




app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/users",userRoute);

app.use("/api/v1/demande-users",demandeUserRoute);

app.use("/api/v1/service",serviceManagementRoute);


app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.use(errorHandler);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
