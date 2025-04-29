import Joi from 'joi';

export const userValidator = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.base': '"firstName" doit être une chaîne',
      'string.min': '"firstName" doit avoir au moins 2 caractères',
      'string.max': '"firstName" doit avoir au plus 50 caractères',
      'any.required': '"firstName" est requis'
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.base': '"lastName" doit être une chaîne',
      'string.min': '"lastName" doit avoir au moins 2 caractères',
      'string.max': '"lastName" doit avoir au plus 50 caractères',
      'any.required': '"lastName" est requis'
    }),

  email: Joi.string()
    .email({ tlds: { allow: ['com', 'net', 'org' , 'sn' , 'co'] } })
    .required()
    .messages({
      'string.base': '"email" doit être une chaîne',
      'string.email': '"email" doit être une adresse e-mail valide',
      'any.required': '"email" est requis'
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.base': '"phone" doit être une chaîne',
      'string.pattern.base': '"phone" doit être un numéro de téléphone valide (10 chiffres)',
      'any.required': '"phone" est requis'
    }),

  password: Joi.string()
    .min(8)
    .max(20)
    .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)
    .required()
    .messages({
      'string.base': '"password" doit être une chaîne',
      'string.min': '"password" doit avoir au moins 8 caractères',
      'string.max': '"password" doit avoir au plus 20 caractères',
      'string.pattern.base': '"password" doit contenir au moins une majuscule, un chiffre et un caractère spécial',
      'any.required': '"password" est requis'
    }),

  role: Joi.string()
    .valid('admin', 'user', 'manager') // Ajoute les rôles valides ici
    .required()
    .messages({
      'string.base': '"role" doit être une chaîne',
      'any.only': '"role" doit être l\'un des suivants : admin, user, manager',
      'any.required': '"role" est requis'
    }),
});
