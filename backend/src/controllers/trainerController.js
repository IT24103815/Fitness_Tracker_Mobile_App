const User = require('../models/User');

// @desc    Connect a client to trainer
// @route   POST /api/trainers/connect-client
// @access  Private (Trainer)
const connectClient = async (req, res) => {
    try {
        const { clientId, clientName } = req.body;
        
        let client;
        if (req.body._id) {
            client = await User.findById(req.body._id);
        } else {
            client = await User.findOne({ 
                clientId: clientId.toUpperCase(), 
                name: { $regex: new RegExp(`^${clientName}$`, 'i') },
                role: 'client'
            });
        }

        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found with those details' });
        }

        client.trainer = req.user._id;
        await client.save();

        res.json({ success: true, message: 'Client successfully connected!', client });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all connected clients
// @route   GET /api/trainers/my-clients
// @access  Private (Trainer)
const getMyClients = async (req, res) => {
    try {
        const clients = await User.find({ trainer: req.user._id }).select('-password');
        res.json({ success: true, clients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get specific client detail (including stats/plans)
// @route   GET /api/trainers/client/:id
// @access  Private (Trainer/Admin)
const getClientDetail = async (req, res) => {
    try {
        const client = await User.findById(req.params.id).select('-password');
        if (!client || (req.user.role === 'trainer' && client.trainer.toString() !== req.user._id.toString())) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to client data' });
        }
        res.json({ success: true, client });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAvailableClients = async (req, res) => {
    try {
        // Return ALL registered clients
        const clients = await User.find({ role: 'client' }).select('name email clientId');
        res.json({ success: true, clients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    connectClient,
    getMyClients,
    getClientDetail,
    getAvailableClients
};
