const db = require("../models");
const { html } = require("../service/mailing/htmlTeplate");
const { sendMail } = require("../service/mailing/mailing");
const { sendNotificationToUser } = require("./webPush")


exports.createNotification = async (req, res, next) => {
    try {
        const receiver = req.params.id
        // const {message,type,sender}=req.body;
        let Notifications = await db.Notifications.create({ ...req.body, receiver })
        return res.status(200).json(Notifications);
    } catch (err) {
        next(err);
    }
};



exports.getNotificationPerUser = async (req, res, next) => {
    try {
        let uid = req.params.id;
        let founduser = await db.User.findById(uid)
            .populate({ path: "notifications" })
        return res.status(200).json(founduser.notifications);
    } catch (error) {
        return next(error);
    }
};



