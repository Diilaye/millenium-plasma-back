import mongoose from "mongoose";
import dotenv from "dotenv";// adapte le chemin si besoin
import User , { IUser } from "../models/interfaces/user.interface";

dotenv.config();


const MONGO_URI = process.env.MODE ==="dev" ? process.env.DATABASE_URL_DEV as string : process.env.DATABASE_URL;

if (!MONGO_URI) {
  console.error("❌ L'URI de la base de données n'est pas définie dans les variables d'environnement");
  process.exit(1);
}


const createAdmin = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("🔗 Connexion à MongoDB en cours...");
    console.log(MONGO_URI);
    console.log("✅ Connexion à MongoDB réussie");

    const existingAdmin = await User.findOne({ phone: "221772488807" });
    if (existingAdmin) {
      console.log("⚠️ Un administrateur avec ce numéro existe déjà");
      process.exit(0);
    }

    const adminData: Partial<IUser> = {
      firstName: "Admin",
      lastName: "Root",
      email: "admin@mp.com",
      phone: "221772488807",
      password: "passer123", // sera hashé par le hook
      role: "Admin",
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newAdmin = new User(adminData);
    await newAdmin.save();

    console.log("✅ Administrateur créé avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'admin :", error);
    process.exit(1);
  }
};

createAdmin();
