import jwt from "jsonwebtoken";
import {Request, Response, NextFunction} from "express";
import CustomError from "../utils/CustumError";

import User from "../models/interfaces/user.interface";
import { RequestWithUser } from "../types/request-with-user";


export const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {

   

    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
       
        const bearerToken =token.replace("Bearer ", "");
        

        if (!bearerToken) {
            return res.status(401).json({ message: "⚠️ Non autorisé" });
        }

        const decoded: any = jwt.verify(bearerToken, process.env.JWT_SECRET as string);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) {
            return res.status(401).json({ message: "⚠️ Utilisateur non trouvé" });
        }

        next();
    } catch (error) {
        return res.status(401).json({ message: "⚠️ Token invalide" });
    }
};
