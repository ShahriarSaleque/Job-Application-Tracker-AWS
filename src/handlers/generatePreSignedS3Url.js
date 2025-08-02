const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = new S3Client();
const BUCKET_NAME = process.env.BUCKET_NAME;

exports.generatePreSignedS3UrlHandler = async (event) => {
    try {
        const { fileName, contentType } = JSON.parse(event.body);

        if(!fileName || !contentType) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "File name and content type are required" }),
            };
        }

        // Generate a unique key for the upload file 
        const key = `uploads/${fileName}`;

        // Generate the pre-signed URL
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
            ContentType: contentType,
        });

        const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // URL valid for 5 minutes

        console.log("Generated pre-signed URL:", signedUrl);

        // Construct the public file URL
        const fileUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;

        return {
            statusCode: 200,
            body: JSON.stringify({ signedUrl, fileUrl }),
        };

    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
}