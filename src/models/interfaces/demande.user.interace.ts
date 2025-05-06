import mongoose, {Document, Query} from "mongoose";
import {DemandeUserSchemas} from "../schemas/demande-user.schema";

export interface IDemandeUser extends Document {
    id: string;
    phone: string;
    isTreat: boolean;
    CratedAt: Date;
    updatedAt: Date;    
    updatedFields?: Record<string, any>;

    // Method
    treatDemandeUser(): Promise<void>;
    getDemandeUser(): Promise<IDemandeUser>;
    getAllDemandeUser(): Promise<IDemandeUser[]>;

}

export default mongoose.model<IDemandeUser>("DemandeUser", DemandeUserSchemas);