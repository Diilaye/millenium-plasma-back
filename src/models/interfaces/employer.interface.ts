import mongoose from "mongoose";
import { EmployerSchema } from "../schemas/employer.schemas";

// employer.interface.ts
export interface IEmployer {
    id?: string;
    fullName: string;
    age: number;
    phone: string;
    address: string;
    position: string;
    salary: number;
    availability: string;
    status: 'available' | 'unavailable' | 'busy';
    photo: string;
    cv: string;
    certifications: string[];
    experience: string;
    languages: string[];
    skills: string[];
    notes?: string;
    userId?: string; // Référence à l'utilisateur propriétaire
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }


  // Créer un virtual pour l'âge formaté (pour l'affichage)
  EmployerSchema.virtual('ageFormatted').get(function(this: IEmployer) {
      return `${this.age} ans`;
    });
    
    // Créer un virtual pour le salaire formaté (pour l'affichage)
    EmployerSchema.virtual('salaryFormatted').get(function(this: IEmployer) {
      return `${this.salary.toLocaleString('fr-SN')} FCFA`;
    });
  


  export default mongoose.model<IEmployer>("employer", EmployerSchema);
  