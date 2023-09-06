import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import sharp from 'sharp';

async function compressImage(buffer: ArrayBuffer) {
	return sharp(buffer)
		.resize({
			width: 512,
		})
		.webp({ quality: 60 })
		.toBuffer();
}

const {
	ACCR_AWS_REGION = '',
	ACCR_AWS_ASSETS_BUCKET = '',
	ACCR_AWS_ACCESS_KEY_ID = '',
	ACCR_AWS_SECRET_ACCESS_KEY = '',
} = process.env;

const s3Client = new S3Client({
	region: ACCR_AWS_REGION, // Replace with your desired AWS region
	credentials: {
		accessKeyId: ACCR_AWS_ACCESS_KEY_ID,
		secretAccessKey: ACCR_AWS_SECRET_ACCESS_KEY,
	},
});

export async function getCompressedImageUrl(originalImageUrl: string): Promise<string | null> {
	try {
		const imageResponse = await fetch(originalImageUrl);
		var imageBuffer = await imageResponse.arrayBuffer();
	} catch (error) {
		console.error('Error downloading image', originalImageUrl, error);
		return null;
	}

	const compressedImage = await compressImage(imageBuffer);

	const hash = crypto.createHash('sha256');
	hash.update(originalImageUrl);
	const hashResult = hash.digest('hex');

	const key = `${hashResult}.webp`;

	// Upload to S3 bucket
	await s3Client.send(
		new PutObjectCommand({
			Key: key,
			Bucket: ACCR_AWS_ASSETS_BUCKET,
			Body: compressedImage,
			ContentType: 'image/webp',
		})
	);

	// Return S3 url
	return `https://${ACCR_AWS_ASSETS_BUCKET}.s3.amazonaws.com/${key}`;
}
