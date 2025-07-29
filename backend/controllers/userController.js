const User = require("../models/userModel");
const jwt = require('jsonwebtoken');

const getUserById = async (req, res) => {
    try {
        console.log("fct: getUserById");
        const userId = req.user.id;
        const user = await User.findOne({_id: userId});
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getUserById }; 