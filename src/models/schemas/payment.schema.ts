import { Schema } from "mongoose";
import { DateTime } from "luxon";

export const PaymentSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false, // Rendre le champ optionnel pour permettre les paiements sans authentification
    },
    
    amount: {
      type: Number,
      required: true,
    },
    
    currency: {
      type: String,
      default: "XOF",
      enum: ["XOF", "USD", "EUR"],
    },
    
    method: {
      type: String,
      required: true,
      enum: ["OM", "WAVE", "CARD", "BANK_TRANSFER"],
    },
    
    type: {
      type: String,
      enum: ["payment", "refund", "payment_link"],
      default: "payment",
    },
    
    client: {
      type: String,
      required: true,
    },
    
    phone: {
      type: String,
    },
    
    email: {
      type: String,
    },
    
    description: {
      type: String,
    },
    
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED", "CANCELLED"],
      default: "PENDING",
    },
    
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    reference: {
      type: String,
      unique: true,
    },
    
    paymentLink: {
      type: String,
    },
    
    metadata: {
      type: Object,
      default: {},
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
