import {
	DeleteObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import crypto from 'crypto';
import type { Logger } from 'pino';
import sharp from 'sharp';
import { logger } from './logger';

const {
	ACCR_AWS_REGION = '',
	ACCR_AWS_ASSETS_BUCKET = '',
	ACCR_AWS_ACCESS_KEY_ID = '',
	ACCR_AWS_SECRET_ACCESS_KEY = '',
} = process.env;

export class ImageUploader {
	private s3Client: S3Client;
	private logger: Logger;

	constructor() {
		this.s3Client = new S3Client({
			region: ACCR_AWS_REGION,
			credentials: {
				accessKeyId: ACCR_AWS_ACCESS_KEY_ID,
				secretAccessKey: ACCR_AWS_SECRET_ACCESS_KEY,
			},
		});

		this.logger = logger.child({ id: ImageUploader.name });
	}

	private compressImage(buffer: ArrayBuffer) {
		return sharp(buffer)
			.resize({
				width: 512,
			})
			.webp({ quality: 60 })
			.toBuffer();
	}

	private async uploadImage(
		originalImageUrl: string
	): Promise<{ url: string; key: string } | null> {
		try {
			const imageResponse = await fetch(originalImageUrl);
			var imageBuffer = await imageResponse.arrayBuffer();
		} catch (error) {
			this.logger.error({ originalImageUrl, error }, 'Error downloading image');
			return null;
		}

		const compressedImage = await this.compressImage(imageBuffer);

		const hashResult = crypto
			.createHash('sha1')
			.update(originalImageUrl)
			.digest('base64')
			.replaceAll('/', '_'); // To avoid folders in the s3 bucket
		const key = `${hashResult}.webp`;

		// Upload to S3 bucket
		await this.s3Client.send(
			new PutObjectCommand({
				Key: key,
				Bucket: ACCR_AWS_ASSETS_BUCKET,
				Body: compressedImage,
				ContentType: 'image/webp',
			})
		);

		// Return S3 url
		return {
			url: `https://${ACCR_AWS_ASSETS_BUCKET}.s3.amazonaws.com/${encodeURIComponent(key)}`,
			key,
		};
	}

	private async cleanUnusedImages(keys: string[]) {
		try {
			const listCommand = new ListObjectsV2Command({
				Bucket: ACCR_AWS_ASSETS_BUCKET,
			});
			const { Contents } = await this.s3Client.send(listCommand);

			if (!Contents) {
				this.logger.error('Contents undefined');
				return null;
			}

			for (const s3Object of Contents) {
				const fileKey = s3Object.Key;

				if (fileKey && !keys.includes(fileKey)) {
					const deleteCommand = new DeleteObjectCommand({
						Bucket: ACCR_AWS_ASSETS_BUCKET,
						Key: fileKey,
					});
					await this.s3Client.send(deleteCommand);
				}
			}
		} catch (error) {
			this.logger.error({ error }, 'Error removing unused images');
		}
	}

	public async uploadImages(urlsImages: Set<string>) {
		const s3UrlsCollector = new Map<string, string>();
		const keysCollector = [] as string[];
		for (const originalUrl of urlsImages) {
			const uploadImageResult = await this.uploadImage(originalUrl);
			if (uploadImageResult) {
				s3UrlsCollector.set(originalUrl, uploadImageResult.url);
				keysCollector.push(uploadImageResult.key);
			}
		}

		await this.cleanUnusedImages(keysCollector);
		return s3UrlsCollector;
	}
}
