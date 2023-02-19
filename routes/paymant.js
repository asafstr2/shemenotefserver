const express = require("express");
const router = express.Router({ mergeParams: true });
const {
	createPaymant,
	PaypalcreatePaymant,
	success,
	createPaymanthyp
} = require('../handlers/paymant')

// using prefix /api/paymant/:id/create
router.route('/stripe').post(createPaymant)
router.route('/paypal/:receiverid').post(PaypalcreatePaymant)
router.route('/hyp').post(createPaymanthyp)

module.exports = router;
