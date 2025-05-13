import Joi  from "joi";

export const reviewsAdminValidator = Joi.object({
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
    })
});