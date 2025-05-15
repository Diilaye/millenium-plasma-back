import { Schema } from "mongoose";
import { DateTime } from "luxon";

export const ReservationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    
    employerId: {
      type: Schema.Types.ObjectId,
      ref: "Employer",
    },
    
    // Informations supplémentaires sur l'employé (pour les cas où l'employé n'est pas encore dans la base de données)
    employerInfo: {
      type: Object,
      default: null
    },
    
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceManagement",
    },
    
    // Informations supplémentaires sur le service (pour les cas où le service n'est pas encore dans la base de données)
    serviceInfo: {
      type: Object,
      default: null
    },
    
    // Informations du prospect (utilisateur non connecté)
    clientName: {
      type: String,
    },
    
    clientEmail: {
      type: String,
    },
    
    clientPhone: {
      type: String,
    },
    
    startDate: {
      type: Date,
      required: true,
    },
    
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"],
      default: "PENDING",
    },
    
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
    },
    
    amount: {
      type: Number,
      required: true,
    },
    
    notes: {
      type: String,
    },
    
    address: {
      type: String,
      required: true,
    },
    
    createdAt: {
      type: Date,
      default: () => DateTime.now().setZone('Africa/Dakar').toJSDate(),
    },
    
    updatedAt: {
      type: Date,
      default: () => DateTime.now().setZone('Africa/Dakar').toJSDate(),
    },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);
