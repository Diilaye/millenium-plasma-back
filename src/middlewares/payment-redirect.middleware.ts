import { Request, Response, NextFunction } from 'express';
import axios, { AxiosRequestConfig } from 'axios';

interface PaymentRequestBody {
  method: 'OM' | 'WAVE';
  amount: number;
  rv: string;
}

interface CustomRequest extends Request {
  body: PaymentRequestBody;
  tokenOM?: string;
  redirectUrl?: string;
}

export const generatePaymentRedirect = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { method, amount, rv } = req.body;

  if (!amount || !rv) {
    return res.status(400).json({ message: 'Les champs "amount" et "rv" sont requis.' });
  }

  const baseCallback = 'https://api.verumed.sn/api/v1/transactions';

  try {
    if (method === 'OM') {
      if (!req.tokenOM) {
        return res.status(401).json({ message: 'Token Orange Money manquant.' });
      }

      const configOrangoMoney: AxiosRequestConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.sandbox.orange-sonatel.com/api/eWallet/v4/qrcode',
        headers: {
          Authorization: `Bearer ${req.tokenOM}`,
          'Content-Type': 'application/json',
        },
        data: {
          amount: {
            unit: 'XOF',
            value: amount,
          },
          callbackCancelUrl: `${baseCallback}/errorOrange?rv=${rv}`,
          callbackSuccessUrl: `${baseCallback}/successOrange?rv=${rv}`,
          code: 159515,
          metadata: {},
          name: 'Verumed',
          validity: 15,
        },
      };

      const response = await axios.request(configOrangoMoney);
      req.redirectUrl = response.data?.deepLink;
      return next();
    } else {
      const waveConfig: AxiosRequestConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.wave.com/v1/checkout/sessions',
        headers: {
          Authorization:
            `Bearer ${process.env.WAVE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        data: {
          amount,
          currency: 'XOF',
          error_url: `${baseCallback}/errorWave?rv=${rv}`,
          success_url: `${baseCallback}/success-wave?rv=${rv}`,
        },
      };

      const response = await axios.request(waveConfig);
      req.redirectUrl = response.data?.wave_launch_url;
      return next();
    }
  } catch (error: any) {
    console.error('Erreur de génération de lien de paiement :', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Échec lors de la génération du lien de paiement.',
      statusCode: 500,
      data: error.response?.data || error.message,
      status: 'NOT OK',
    });
  }
};
