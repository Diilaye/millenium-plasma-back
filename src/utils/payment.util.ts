import axios, { AxiosRequestConfig } from 'axios';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a payment link based on the payment method
 * @param method Payment method (WAVE, OM)
 * @param amount Payment amount
 * @param reference Payment reference
 * @param clientName Client name
 * @returns Payment link URL
 */
export const generatePaymentLink = async (
  method: 'WAVE' | 'OM',
  amount: number,
  reference: string,
  clientName: string
): Promise<string> => {
  try {
    // Base callback URL for payment notifications
    const baseCallback = 'https://mp-api.nataal.shop/api/v1/payments/callback';

    if (method === 'OM') {
      // Get Orange Money token
      const tokenResponse = await getOrangeMoneyToken();
      
      if (!tokenResponse) {
        throw new Error('Impossible d\'obtenir le token Orange Money');
      }

      const configOrangoMoney: AxiosRequestConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.sandbox.orange-sonatel.com/api/eWallet/v4/qrcode',
        headers: {
          Authorization: `Bearer ${tokenResponse}`,
          'Content-Type': 'application/json',
        },
        data: {
          amount: {
            unit: 'XOF',
            value: amount,
          },
          callbackCancelUrl: `${baseCallback}/error-om?reference=${reference}`,
          callbackSuccessUrl: `${baseCallback}/success-om?reference=${reference}`,
          code: 159515,
          metadata: { reference, clientName },
          name: 'Millennium-Placement',
          validity: 15,
        },
      };

      const response = await axios.request(configOrangoMoney);
      return response.data?.deepLink;
    } else {
      // Wave payment
      // Wave API only accepts specific fields, adding extra fields causes validation errors
      const waveConfig: AxiosRequestConfig = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.wave.com/v1/checkout/sessions',
        headers: {
          Authorization: `Bearer ${process.env.WAVE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        data: {
          amount,
          currency: 'XOF',
          error_url: `${baseCallback}/error-wave?reference=${reference}`,
          success_url: `${baseCallback}/success-wave?reference=${reference}`,
          // Note: metadata is not supported by Wave API v1 checkout sessions
        },
      };

      const response = await axios.request(waveConfig);
      return response.data?.wave_launch_url;
    }
  } catch (error: any) {
    console.error('Erreur de génération de lien de paiement :', error.response?.data || error.message);
    throw new Error('Échec lors de la génération du lien de paiement: ' + (error.response?.data?.message || error.message));
  }
};

/**
 * Get Orange Money token
 * @returns Orange Money token
 */
const getOrangeMoneyToken = async (): Promise<string | null> => {
  try {
    const tokenConfig: AxiosRequestConfig = {
      method: 'post',
      url: 'https://api.sandbox.orange-sonatel.com/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${process.env.ORANGE_MONEY_BASIC_AUTH}`,
      },
      data: 'grant_type=client_credentials',
    };

    const response = await axios.request(tokenConfig);
    return response.data?.access_token || null;
  } catch (error) {
    console.error('Erreur lors de l\'obtention du token Orange Money:', error);
    return null;
  }
};
