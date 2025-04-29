import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI = process.env.MODE ==="dev" ? process.env.DATABASE_URL_DEV as string : process.env.DATABASE_URL;



const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        return  "MongoDB connect to uri :" + MONGO_URI ;
    } catch (error) {
        console.error("Erreur de connexion à MongoDB :", error);
        process.exit(1);
    }
};

export default connectDB;
