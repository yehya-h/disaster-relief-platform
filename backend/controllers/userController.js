const User = require("../models/userModel");
const jwt = require('jsonwebtoken');
const Location = require("../models/userLocationModel");

const getUserById = async (req, res) => {
    try {
        console.log("fct: getUserById");
        const userId = req.user.id;
        const user = await User.findOne({_id: userId});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const locations = await Location.find({userId: user._id});
        if(!locations) {
            return res.status(404).json({ message: "Locations not found" });
        }
        const userData = {
            ...user._doc,
            locations: locations
        }
        res.status(200).json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserById }; 