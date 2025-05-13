import mongoose, {Document, Query} from "mongoose";
import { ServiceManagementSchemas } from "../schemas/service-management.schemas";

export interface IServiceManagement extends Document {
    id: string;
    nom: string;
    price: number;
    description: string;
    isAvailable: boolean;
    CratedAt: Date;
    updatedAt: Date;    
    updatedFields?: Record<string, any>;

    // Method
    getServideManagement(): Promise<IServiceManagement>;
    getAllserviceManagement(): Promise<IServiceManagement[]>;

}


export default mongoose.model<IServiceManagement>("ServiceManagement", ServiceManagementSchemas);