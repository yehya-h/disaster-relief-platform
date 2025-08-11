const Type = require("../models/typeModel");
const axios = require('axios');
require('dotenv').config();

let agentUrl = process.env.AGENT_API_ENDPOINT;

if (!agentUrl && process.env.AGENT_API_IP && process.env.AGENT_API_PORT) {
    agentUrl = `http://${process.env.AGENT_API_IP}:${process.env.AGENT_API_PORT}`;
}

const getAllTypes = async (req, res) => {
    try {
        const types = await Type.find();
        res.status(200).json(types);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addType = async (req, res) => {
    try {
        const { name, safetyTips } = req.body;
        const type = await Type.create({ name, safetyTips });
        axios.get(`${agentUrl}/refresh-types`);
        res.status(201).json(type);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, safetyTips } = req.body;
        if (!name || !safetyTips) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const type = await Type.findByIdAndUpdate(id, { name, safetyTips }, { new: true });
        if (!type) {
            return res.status(404).json({ message: "Type not found." });
        }
        axios.get(`${agentUrl}/refresh-types`);
        res.status(200).json(type);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteType = async (req, res) => {
    try {
        const { id } = req.params;
        const type = await Type.findByIdAndDelete(id);
        if (!type) {
            return res.status(404).json({ message: "Type not found." });
        }
        axios.get(`${agentUrl}/refresh-types`);
        res.status(200).json({ message: "Type deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllTypes, addType, updateType, deleteType };