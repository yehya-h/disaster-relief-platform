const Notification = require('../models/notificationModel');
const Form = require('../models/formModel');


const getNotificationsById = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.find({
        userId,
        notificationType: 'nearby_incident'
        })
        const incidentIds = notifications.map(n => n.incidentId);

        const forms = await Form.find({
        incidentId: { $in: incidentIds },
        active: true
        }).select('_id')
        .select('description')
        .select('severity ')
        .select('timestamp')
        .select('location')
        .select("typeId").populate({
          path: "typeId",
          model: "Type", 
      })
        console.log('Fetched forms:', forms);
        res.status(200).json(forms); 
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = {
    getNotificationsById
};