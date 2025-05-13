import Joi  from "joi";

export const reviewsClientValidator = Joi.object({
  id: Joi.string()
    .required()
    .messages({
      'string.base': '"id" doit être une chaîne',
      'any.required': '"id" est requis'
    }),
  rating: Joi.number()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': '"rating" doit être un nombre',
      'number.min': '"rating" doit être au moins 1',
      'number.max': '"rating" doit être au plus 5',
      'any.required': '"rating" est requis'
    }),
  nomPersonnel: Joi.string()
    .required()
    .messages({
      'string.base': '"nomPersonnel" doit être une chaîne',
      'any.required': '"nomPersonnel" est requis'
    }),
  telephonePersonnel: Joi.string()
    .required()
    .messages({
      'string.base': '"telephonePersonnel" doit être une chaîne',
      'any.required': '"telephonePersonnel" est requis'
    }),
  nomClient: Joi.string()
    .required()
    .messages({
      'string.base': '"nomClient" doit être une chaîne',
      'any.required': '"nomClient" est requis'
    }),
  telephoneClient: Joi.string()
    .required()
    .messages({
      'string.base': '"telephoneClient" doit être une chaîne',  
      'any.required': '"telephoneClient" est requis'
    }),
  serviceManagement: Joi.string()
    .required()
    .messages({
      'string.base': '"serviceManagement" doit être une chaîne',
      'any.required': '"serviceManagement" est requis'
    }),
  comment: Joi.string()
    .required()
    .messages({
      'string.base': '"comment" doit être une chaîne',
      'any.required': '"comment" est requis'
    }),
  isVisible: Joi.boolean()
    .default(true)
    .messages({
      'boolean.base': '"isVisible" doit être un booléen'
    }),


});