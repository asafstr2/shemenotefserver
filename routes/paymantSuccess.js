const express = require("express");
const router = express.Router({ mergeParams: true });
const { success, successhyp } = require('../handlers/paymant')

// using prefix /api/paymant/:id/create

router.route('/').get(successhyp)
router.route("/success/:receiverid/:currency/:value").get(success);

module.exports = router;
