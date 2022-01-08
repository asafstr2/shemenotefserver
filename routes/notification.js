const express = require("express");
const router = express.Router({ mergeParams: true });
const { createNotification, getNotificationPerUser } = require("../handlers/notifications");

// using prefix /api/user/:id/notification
router.route("/")
    .get(getNotificationPerUser)
    .post(createNotification);

module.exports = router;
