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
    price: Joi.number().positive()
  
});