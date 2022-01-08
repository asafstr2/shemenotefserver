const express = require("express");
const router = express.Router({ mergeParams: true });
const { createPaymant, PaypalcreatePaymant,success} = require("../handlers/paymant");

// using prefix /api/paymant/:id/create
router.route("/stripe").post(createPaymant);
router.route("/paypal/:receiverid").post(PaypalcreatePaymant);

module.exports = router;
