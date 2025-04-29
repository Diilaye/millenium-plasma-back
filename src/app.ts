import express from 'express';
import * as dotenv from 'dotenv';
import connectDB from "./configs/db";
import {errorHandler} from "./middlewares/errorHandler";
import bodyParser from "body-parser";
import userRoute from "./routes/utilisateur.route";
import demandeUserRoute from "./routes/demande-user.route";
import cors from "cors";
import cookieParser from 'cookie-parser';

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

app.use(cors({
    origin: ['http://localhost:3030'],
    credentials: true
  }
));




app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/users",userRoute);

app.use("/api/v1/demande-users",demandeUserRoute);


app.get('/', (_req, res) => {
  res.send('Hello World!');
});

app.use(errorHandler);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
