const Type = require("../models/typeModel");

const getAllTypes = async (req, res) => {
    try {
        const types = await Type.find();
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { getAllTypes };