import fs from 'fs';
import path from "path";
import {  privateDecrypt } from 'crypto';

export const decryptWithPrivateKey = (encryptedData: string): string => {
    const decryptedData = privateDecrypt(fs.readFileSync(path.resolve(__dirname, '../../private.key'), 'utf-8'), Buffer.from(encryptedData, 'base64'));
    return decryptedData.toString('utf-8');
};
