// pages/api/s3-upload.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,       // ❗ NOT NEXT_PUBLIC
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  try {
    const { filename, type } = req.query;

    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
      Key: filename,
      ContentType: type,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 }); // valid for 1 minute

    res.status(200).json({ uploadUrl });
  } catch (error) {
    console.error("S3 presign error:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
}
