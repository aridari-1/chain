import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const params = {
  Bucket: "1chain-app", // your bucket name
  Key: "test.txt",
  Body: "Hello from Voice Chain test",
};

try {
  const result = await s3.send(new PutObjectCommand(params));
  console.log("✅ Upload succeeded!", result);
} catch (err) {
  console.error("❌ Upload failed:", err);
}
