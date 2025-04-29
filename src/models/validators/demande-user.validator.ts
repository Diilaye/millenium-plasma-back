import Joi from 'joi';

export const demandeUserValidator = Joi.object({
  phone: Joi.string()
    .pattern(/^[0-9]{9}$/)
    .required()
    .messages({
      'string.base': '"phone" doit être une chaîne',
      'string.pattern.base': '"phone" doit être un numéro de téléphone valide (10 chiffres)',
      'any.required': '"phone" est requis'
    }),
});