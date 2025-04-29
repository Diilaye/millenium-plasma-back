// @ts-ignore

import mongoose, {Document, Query} from "mongoose";
import {UserSchema} from "../schemas/user.schema";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import {DateTime} from "luxon";
import CustomError from "../../utils/CustumError";


export interface IUser extends Document {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    lastLogin: Date;
    isActive: boolean;
    statusOnline: string;
    createdAt: Date;
    updatedAt: Date;
    updatedFields?: Record<string, any>;
    // Method
    comparePassword(candidatePassword: string): boolean;
    generateToken() : Promise<string>;
}

UserSchema.pre<IUser>("save", async function (next) {
    if (!this.isModified("password")) return next();
    if (this.isModified()) {
        this.updatedAt = DateTime.now().setZone('Africa/Dakar').toJSDate();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.pre<Query<any, IUser>>("findOneAndUpdate", async function (next) {
    const update = this.getUpdate() as any;
    if (!update) return next();

    const userId = update.$set?.modifierId;
    if (!userId) {

        const err =  new CustomError("🔴 Modification refusée : Aucun utilisateur spécifié", 500);
        next(err);
        return;
    }

    const user = await this.model.findOne(this.getQuery());
    if (!user) {
        const err =  new CustomError("🔴 Utilisateur introuvable.", 500);
        next(err);
        return;
    }

    if (user.id.toString() !== userId.toString()) {
        const err =  new CustomError("🔴 Modification refusée : Seul le créateur peut le modifier.", 500);
        next(err);
        return;
    }

    update.$set = update.$set || {};
    update.$set.updatedAt = new Date();
    next();
});

UserSchema.methods.comparePassword =  function (
    candidatePassword: string
): boolean {
    return bcrypt.compareSync(candidatePassword, this.password);
};

UserSchema.methods.generateToken = async function(): Promise<string> {
    const user = this;
    const token = jwt.sign({ id: this._id , role: this.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    user.token = token;
    await user.save();
    return token;
};


export default mongoose.model<IUser>("User", UserSchema);

