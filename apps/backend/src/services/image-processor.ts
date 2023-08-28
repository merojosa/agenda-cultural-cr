import sharp from 'sharp';

async function compressImage(buffer: ArrayBuffer) {
	return sharp(buffer).resize(256, 256, { fit: 'cover' }).webp({ quality: 60 }).toBuffer();
}

export async function getCompressedImageUrl(originalImageUrl: string): Promise<string | null> {
	try {
		const imageResponse = await fetch(originalImageUrl);
		var imageBuffer = await imageResponse.arrayBuffer();
	} catch (error) {
		console.error('Error downloading image', originalImageUrl, error);
		return null;
	}

	const compressedImage = await compressImage(imageBuffer);
	console.log('BREAKPOINT', compressedImage.length);

	// Upload to S3 bucket

	// Return S3 url
	return '';
}
