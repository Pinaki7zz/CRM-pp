const AWS = require("aws-sdk");

const s3 = new AWS.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

/**
 * Upload file to S3
 */
const uploadToS3 = async (file) => {
	if (!file) return null;

	const key = `leads/${Date.now()}_${file.originalname}`;

	const params = {
		Bucket: process.env.AWS_S3_BUCKET_NAME,
		Key: key,
		Body: file.buffer,
		ContentType: file.mimetype,
	};

	const { Location } = await s3.upload(params).promise();
	return Location; // public URL
};

/**
 * Delete file from S3
 */
const deleteFromS3 = async (imageUrl) => {
	if (!imageUrl) return;

	const key = imageUrl.split(".com/")[1];

	await s3
		.deleteObject({
			Bucket: process.env.AWS_S3_BUCKET_NAME,
			Key: key,
		})
		.promise();
};

module.exports = { uploadToS3, deleteFromS3 };
