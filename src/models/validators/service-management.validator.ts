import Joi from 'joi';

export const serviceManagementValidator = Joi.object({
  nom: Joi.string()
      .min(2)
      .max(50)
      .required()
      .messages({
        'string.base': '"nom" doit être une chaîne',
        'string.min': '"nom" doit avoir au moins 2 caractères',
        'string.max': '"nom" doit avoir au plus 50 caractères',
        'any.required': '"nom" est requis'
      }),
  description: Joi.string()
      .required()
      .messages({
        'string.base': '"description" doit être une chaîne',
        'any.required': '"description" est requis'
      }),
  isAvailable: Joi.boolean()
      .default(true)
      .messages({
        'boolean.base': '"isAvailable" doit être un booléen'
      }),
  
    price: Joi.number().positive()
  
});