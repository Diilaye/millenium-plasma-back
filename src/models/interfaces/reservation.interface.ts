import mongoose, { Document, Model } from "mongoose";
import { ReservationSchema } from "../schemas/reservation.schema";

export interface IReservation extends Document {
  userId?: mongoose.Types.ObjectId;
  employerId?: mongoose.Types.ObjectId;
  // Informations supplémentaires sur l'employé
  employerInfo?: {
    name: string;
    role: string;
    image: string;
  };
  serviceId?: mongoose.Types.ObjectId;
  // Informations supplémentaires sur le service
  serviceInfo?: {
    name: string;
    description: string;
    price: number;
  };
  // Informations du prospect (utilisateur non connecté)
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  startDate: Date;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  paymentId?: mongoose.Types.ObjectId;
  amount: number;
  notes?: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationModel: Model<IReservation> = mongoose.model<IReservation>(
  "Reservation",
  ReservationSchema
);

export default ReservationModel;
