import mongoose, { Document } from "mongoose";
import { PaymentSchema } from "../schemas/payment.schema";
import { DateTime } from "luxon";

export interface IPayment extends Document {
  id: string;
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  method: string;
  type: string;
  client: string;
  phone?: string;
  email?: string;
  description?: string;
  status: string;
  transactionId?: string;
  reference?: string;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Pre-save middleware to update timestamps
PaymentSchema.pre<IPayment>("save", function (next) {
  if (this.isNew) {
    this.createdAt = DateTime.now().setZone('Africa/Dakar').toJSDate();
  }
  this.updatedAt = DateTime.now().setZone('Africa/Dakar').toJSDate();
  next();
});

export default mongoose.model<IPayment>("Payment", PaymentSchema);
