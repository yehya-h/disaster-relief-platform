const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

// const uploadImageToImgbb = async (file) => {
//     try {
//       if (!file || !file.path) {
//         throw new Error("No image file or file path provided");
//       }
  
//       // Read image file from disk
//       const imageBuffer = fs.readFileSync(file.path);
//       const imageBase64 = imageBuffer.toString('base64');
  
//       // Prepare data for imgbb
//       const params = new URLSearchParams();
//       params.append('key', process.env.IMGBB_API_KEY); // Or replace with your actual key for testing
//       params.append('image', imageBase64);
//       params.append('name', file.originalname);
  
//       const imgbbResponse = await axios.post(
//         'https://api.imgbb.com/1/upload',
//         params,
//         {
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//           },
//         }
//       );
  
//       const imageUrl = imgbbResponse.data.data.url;
//       return imageUrl;
//     } catch (error) {
//       console.error('Image upload to imgbb failed:', error.message);
//       throw error;
//     }
//   };

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