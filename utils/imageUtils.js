import { v2 as cloudinary } from 'cloudinary';

// Assuming cloudinary is already configured elsewhere or configure here:
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});
const uploadToCloudinary = async (imageUrl) => {
    try {
        const uploadResponse = await cloudinary.uploader.upload(imageUrl, {
            folder: 'tattoo-designs', // optional: organize uploads in a folder
            resource_type: 'image',
        });
        return uploadResponse.secure_url;
    } catch (error) {
        console.error('Cloudinary upload failed:', error);
        throw error;
    }
};

export { uploadToCloudinary };
