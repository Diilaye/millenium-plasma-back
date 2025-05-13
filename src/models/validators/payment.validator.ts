import Joi from 'joi';

export const paymentValidator = Joi.object({
  userId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.base': '"userId" doit être une chaîne',
      'string.pattern.base': '"userId" doit être un ID MongoDB valide',
      'any.required': '"userId" est requis'
    }),

  amount: Joi.number()
    .positive()
    .required()
    .messages({
      'number.base': '"amount" doit être un nombre',
      'number.positive': '"amount" doit être un nombre positif',
      'any.required': '"amount" est requis'
    }),

  currency: Joi.string()
    .valid('XOF', 'USD', 'EUR')
    .default('XOF')
    .messages({
      'string.base': '"currency" doit être une chaîne',
      'any.only': '"currency" doit être l\'une des devises suivantes : XOF, USD, EUR',
    }),

  method: Joi.string()
    .valid('OM', 'WAVE', 'CARD', 'BANK_TRANSFER')
    .default('WAVE')
    .messages({
      'string.base': '"method" doit être une chaîne',
      'any.only': '"method" doit être l\'une des méthodes suivantes : OM, WAVE, CARD, BANK_TRANSFER'
    }),
    
  type: Joi.string()
    .valid('payment', 'refund', 'payment_link')
    .default('payment')
    .messages({
      'string.base': '"type" doit être une chaîne',
      'any.only': '"type" doit être l\'un des types suivants : payment, refund, payment_link'
    }),
    
  client: Joi.string()
    .required()
    .messages({
      'string.base': '"client" doit être une chaîne',
      'any.required': '"client" est requis'
    }),
    
  phone: Joi.string()
    .allow('')
    .optional()
    .messages({
      'string.base': '"phone" doit être une chaîne'
    }),
    
  email: Joi.string()
    .email()
    .allow('')
    .optional()
    .messages({
      'string.base': '"email" doit être une chaîne',
      'string.email': '"email" doit être une adresse email valide'
    }),
    
  description: Joi.string()
    .allow('')
    .optional()
    .messages({
      'string.base': '"description" doit être une chaîne'
    }),
    
  reference: Joi.string()
    .optional()
    .messages({
      'string.base': '"reference" doit être une chaîne'
    }),
    
  metadata: Joi.object()
    .default({})
    .messages({
      'object.base': '"metadata" doit être un objet'
    })
});

export const updatePaymentStatusValidator = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED')
    .required()
    .messages({
      'string.base': '"status" doit être une chaîne',
      'any.only': '"status" doit être l\'un des statuts suivants : PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED',
      'any.required': '"status" est requis'
    }),
    
  transactionId: Joi.string()
    .messages({
      'string.base': '"transactionId" doit être une chaîne',
    }),
});
