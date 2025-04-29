import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import {encryptWithPublicKey} from "./chiffrement";

// Configuration du client S3
const s3Client = new S3Client({
    region: process.env.AWS_REGION, //
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

interface UploadResponse {
    size: number;
    campaigns: string;
    folder: string;
    cryptFile: string;
    cryptUrl: string;
    version: string;
    contentType: string;
}

/**
 * Upload un fichier Base64 sur S3
 * @param base64String Image encodée en Base64
 * @param idUser string
 * @param folder string
 * @param campagnes string
 * @param version string
 * @returns Informations sur l'upload
 */
export const uploadBase64ToS3 = async (
    base64String: string,
    idUser  : string,
    campagnes : string,
    folder : string,
    version:string
): Promise<UploadResponse | Error> => {
    if (!base64String) {
        return new Error("Invalid input: base64 string is required");
    }

    const regex = /^data:([A-Za-z-+/]+\/[A-Za-z-+/]+);base64,(.+)$/;
    const matches = base64String.match(regex);

    if (!matches || matches.length !== 3) {
        return new Error("Invalid base64 format");
    }

    const mimeType: string = matches[1];
    const base64Data: string = matches[2];
    const fileBuffer: Buffer = Buffer.from(base64Data, "base64");

    const fileExtension = mimeType.split("/")[1];
    const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;

   let  filePath : string  ;

    if(campagnes.length === 0 && folder.length === 0) {
        filePath = `uploads/${idUser}/${uniqueFileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")}`;
    }else if(campagnes.length === 0 && folder.length != 0) {
        filePath = `uploads/${idUser}/${folder}/${uniqueFileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")}`;
    } else if(campagnes.length != 0 && folder.length === 0) {
        filePath = `uploads/${idUser}/${campagnes}/roots_folder_campaigns/${uniqueFileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")}`;
    }else {
        filePath = `uploads/${idUser}/${campagnes}/${folder}/${uniqueFileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "")}`;
    }

    console.log("filePath");
    console.log(filePath);


    try {
        // Envoyer sur S3
        const uploadParams = {
            Bucket: process.env.AWS_S3_BUCKET as string,
            Key: filePath,
            Body: fileBuffer,
            ContentType: mimeType,
        };

        const command = new PutObjectCommand(uploadParams);
        await s3Client.send(command);

        const fileURL = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${filePath}`;

        return {
            size: fileBuffer.length,
            campaigns: campagnes,
            folder : folder,
            version : version,
            cryptUrl: encryptWithPublicKey(fileURL),
            cryptFile : encryptWithPublicKey(uniqueFileName),
            contentType: mimeType,
        };
    } catch (error) {
        return new Error(`S3 Upload Error: ${(error as Error).message}`);
    }
};
