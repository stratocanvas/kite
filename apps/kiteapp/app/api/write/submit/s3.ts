"use server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const access = process.env.S3_ACCESS_KEY || "";
const secret = process.env.S3_ACCESS_KEY_SECRET || "";

const S3 = new S3Client({
    region: process.env.NEXT_PUBLIC_S3_REGION || "",
    credentials: {
        accessKeyId: access,
        secretAccessKey: secret,
    },
});

export async function GetUploadURL(path: string, filename: string) {
    const Key = `${path}/${filename}`;
    console.log("Generating presigned URL for:", Key);
    try {
        const url = await getSignedUrl(
            S3,
            new PutObjectCommand({
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET || "",
                Key: Key,
            }),
            { expiresIn: 600 },
        );
        console.log("Presigned URL generated successfully");
        return url;
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        throw error;
    }
}

export async function GetUploadURLs( 
    files: { path: string; filename: string }[],
) {
    console.log("Generating multiple presigned URLs");
    try {
        const urls = await Promise.all(
            files.map(({ path, filename }) => GetUploadURL(path, filename)),
        );
        console.log("All presigned URLs generated successfully");
        return urls;
    } catch (error) {
        console.error("Error generating multiple presigned URLs:", error);
        throw error;
    }
}