const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
            .then(() => console.log('Mongo connected'))
            .catch((err) => console.error(err));
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDB;