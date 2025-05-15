import Joi from "joi";

export const reservationValidator = Joi.object({
  // Champs utilisateur/employé
  userId: Joi.string().optional().allow(null, ''),
  employerId: Joi.string().optional().allow(null, ''),
  // Validation pour les informations supplémentaires de l'employé
  employerInfo: Joi.object({
    name: Joi.string().required(),
    role: Joi.string().required(),
    image: Joi.string().required()
  }).optional(),
  serviceId: Joi.string().optional(),
  // Validation pour les informations supplémentaires du service
  serviceInfo: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required()
  }).optional(),
  
  // Informations du prospect (utilisateur non connecté)
  clientName: Joi.string().optional(),
  clientEmail: Joi.string().email().optional(),
  clientPhone: Joi.string().optional(),
  // Accepter également les champs directs du frontend
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  
  // Détails de la réservation
  startDate: Joi.date().required().messages({
    "date.base": "La date doit être une date valide",
    "any.required": "La date est requise",
  }),
  
  status: Joi.string()
    .valid("PENDING", "CONFIRMED", "CANCELLED", "COMPLETED")
    .default("PENDING"),
  
  paymentId: Joi.string().optional(),
  
  amount: Joi.number().required().messages({
    "number.base": "Le montant doit être un nombre",
    "any.required": "Le montant est requis",
  }),
  
  notes: Joi.string().optional(),
  
  address: Joi.string().required().messages({
    "string.empty": "L'adresse est requise",
    "any.required": "L'adresse est requise",
  }),
}).unknown(true); // Permettre des champs supplémentaires non définis dans le schéma

export const updateReservationStatusValidator = Joi.object({
  status: Joi.string()
    .valid("PENDING", "CONFIRMED", "CANCELLED", "COMPLETED")
    .required()
    .messages({
      "string.empty": "Le statut est requis",
      "any.required": "Le statut est requis",
      "any.only": "Le statut doit être l'un des suivants: PENDING, CONFIRMED, CANCELLED, COMPLETED",
    }),
});
