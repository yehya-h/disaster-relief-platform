const axios = require('axios');
require('dotenv').config();


const uploadImageToImgbb = async (file) => {
    try {
        if (!file) {
            throw new Error("No image provided");
        }
        const imageBase64 = file.buffer.toString('base64');
        const imgbbResponse = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            {
                image: imageBase64,
                name: file.originalname,
                type: file.mimetype,
                size: file.size
            },
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }
        );
        const imageUrl = imgbbResponse.data.data.url;
        return imageUrl;
    } catch (error) {
        throw error;
    }
};

module.exports = { uploadImageToImgbb };