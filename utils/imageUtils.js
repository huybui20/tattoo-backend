const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

const downloadAndSaveImage = async (imageUrl, index, basepath) => {
    try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        await fs.mkdir(uploadsDir, { recursive: true });
        const filename = `${basepath}_${index}.png`;
        const filepath = path.join(uploadsDir, filename);
        // Download image
        const response = await axios({
            method: 'GET',
            url: imageUrl,
            responseType: 'arraybuffer'
        });
        // Save image
        await fs.writeFile(filepath, response.data);
        // Return relative path for database storage
        return `/uploads/${filename}`;
    } catch (error) {
        throw new Error(`Failed to download and save image: ${error.message}`);
    }
};
module.exports = {
    downloadAndSaveImage
};