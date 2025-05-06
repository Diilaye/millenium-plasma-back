
import Joi from 'joi';

// Schéma de validation pour le modèle Employer
export const employerValidator = Joi.object({
  fullName: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Le nom complet est obligatoire',
      'string.min': 'Le nom complet doit contenir au moins {#limit} caractères',
      'string.max': 'Le nom complet ne peut pas dépasser {#limit} caractères',
      'any.required': 'Le nom complet est obligatoire'
    }),

  age: Joi.number()
    .integer()
    .min(18)
    .max(70)
    .required()
    .messages({
      'number.base': "L'âge doit être un nombre",
      'number.integer': "L'âge doit être un nombre entier",
      'number.min': "L'âge minimum est de {#limit} ans",
      'number.max': "L'âge maximum est de {#limit} ans",
      'any.required': "L'âge est obligatoire"
    }),

  phone: Joi.string()
    .pattern(/^(?:\+221|00221)?\s*(?:7[0-9])\s*(?:[0-9]{3})\s*(?:[0-9]{2})\s*(?:[0-9]{2})$/)
    .required()
    .messages({
      'string.empty': 'Le numéro de téléphone est obligatoire',
      'string.pattern.base': 'Le format du numéro de téléphone est invalide (ex: 77 123 45 67)',
      'any.required': 'Le numéro de téléphone est obligatoire'
    }),

  address: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.empty': "L'adresse est obligatoire",
      'string.min': "L'adresse doit contenir au moins {#limit} caractères",
      'string.max': "L'adresse ne peut pas dépasser {#limit} caractères",
      'any.required': "L'adresse est obligatoire"
    }),

  position: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Le poste est obligatoire',
      'string.min': 'Le poste doit contenir au moins {#limit} caractères',
      'string.max': 'Le poste ne peut pas dépasser {#limit} caractères',
      'any.required': 'Le poste est obligatoire'
    }),

  salary: Joi.number()
    .integer()
    .min(30000)
    .required()
    .messages({
      'number.base': 'Le salaire doit être un nombre',
      'number.integer': 'Le salaire doit être un nombre entier',
      'number.min': 'Le salaire minimum est de {#limit} FCFA',
      'any.required': 'Le salaire est obligatoire'
    }),

  availability: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'La disponibilité est obligatoire',
      'string.min': 'La disponibilité doit contenir au moins {#limit} caractères',
      'string.max': 'La disponibilité ne peut pas dépasser {#limit} caractères',
      'any.required': 'La disponibilité est obligatoire'
    }),

  status: Joi.string()
    .valid('available', 'unavailable', 'busy')
    .default('available')
    .messages({
      'any.only': "Le statut doit être 'available', 'unavailable', ou 'busy'"
    }),

  photo: Joi.string()
    .uri()
    .messages({
      'string.uri': "L'URL de la photo est invalide"
    }),

  experience: Joi.string()
    .trim()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': "L'expérience est obligatoire",
      'string.min': "L'expérience doit contenir au moins {#limit} caractères",
      'string.max': "L'expérience ne peut pas dépasser {#limit} caractères",
      'any.required': "L'expérience est obligatoire"
    }),

  languages: Joi.array()
    .items(Joi.string().trim().min(2).max(50))
    .min(1)
    .required()
    .messages({
      'array.min': 'Au moins une langue est obligatoire',
      'any.required': 'Les langues sont obligatoires'
    }),

  skills: Joi.array()
    .items(Joi.string().trim().min(2).max(100))
    .min(1)
    .required()
    .messages({
      'array.min': 'Au moins une compétence est obligatoire',
      'any.required': 'Les compétences sont obligatoires'
    }),

  notes: Joi.string()
    .trim()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Les notes ne peuvent pas dépasser {#limit} caractères'
    })
});