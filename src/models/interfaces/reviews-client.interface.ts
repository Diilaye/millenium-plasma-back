import mongoose, {Document, Query} from "mongoose";
import { ReviewsClientSchemas } from "../schemas/reviews-client.schemas";

export interface IReviewsClient extends Document {
    id: string;
    nomClient: string;
    serviceManagement: string;
    nomPersonnel: string;
    telephoneClient: string;
    telephonePersonnel: string;
    ranking: number;
    comment: string;
    isAvailable: boolean;
    createdAt: Date;
    updatedAt: Date;    
    updatedFields?: Record<string, any>;


}


export default mongoose.model<IReviewsClient>("reviewsClient", ReviewsClientSchemas);