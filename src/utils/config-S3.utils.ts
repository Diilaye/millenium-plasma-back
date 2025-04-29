import {S3Client, PutObjectCommand, ListObjectsV2Command} from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import {encryptWithPublicKey} from "./chiffrement";
import fs from "fs";
import path from "path";
dotenv.config();

const s3 = new S3Client({
    region: process.env.AWS_REGION, // Exemple: 'us-east-1'
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Configurer multer avec S3
const upload = (userName: string )=> multer({
    storage: multerS3({
        s3,
        bucket: process.env.AWS_S3_BUCKET!,
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            cb(null, `uploads/${userName}/${file.originalname}`);
        },
    }),
});

// Fonction pour uploader un fichier dans le dossier chiffré
export const uploadFileToS3 = async (filePath: string, userName: string) => {
    const encryptedFolder = encryptWithPublicKey(userName);
    console.log(encryptedFolder);
    console.error(filePath)
    const fileStream = fs.createReadStream(filePath);
    const fileName = path.basename(filePath);

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${encryptedFolder}/${fileName}`, // 📂 Stockage sécurisé
        Body: fileStream,
        ContentType: "image/jpeg" // Modifier selon le fichier
    };

    try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        console.log(`✅ Fichier "${fileName}" uploadé dans ${encryptedFolder}/`);
    } catch (err) {
        console.error("❌ Erreur lors de l'upload :", err);
    }
};

export const listUserFiles = async (username: string) => {
    const encryptedFolder = encryptWithPublicKey(username);

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Prefix: `${encryptedFolder}/`
    };

    try {
        const command = new ListObjectsV2Command(params);
        const data = await s3.send(command);

        const files = data.Contents?.map(file => ({
            key: file.Key,
            url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.Key}`
        }));

        return files || [];
    } catch (err) {
        console.error("❌ Erreur lors de la récupération des fichiers S3 :", err);
        throw err;
    }
};


export default upload;
