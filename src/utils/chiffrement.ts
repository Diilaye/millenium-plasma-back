import fs from 'fs';
import path from "path";
import { publicEncrypt } from 'crypto';

const publicKey = fs.readFileSync(path.resolve(__dirname, '../../public.key'), 'utf-8');

export const encryptWithPublicKey = (data: string): string => {
    const encryptedData = publicEncrypt(publicKey, Buffer.from(data));
    return encryptedData.toString('base64');
};

