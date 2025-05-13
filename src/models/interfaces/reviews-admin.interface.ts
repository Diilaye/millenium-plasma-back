import mongoose, {Document, Query} from "mongoose";
import { ReviewsAdminSchemas } from "../schemas/reviews-admin.schemas";

export interface IReviewsAdmin extends Document {
    id: string;
    nom: string;
    ranking: number;
    comment: string;
    isAvailable: boolean;
    CratedAt: Date;
    updatedAt: Date;    
    updatedFields?: Record<string, any>;


}


export default mongoose.model<IReviewsAdmin>("reviewsAdmin", ReviewsAdminSchemas);