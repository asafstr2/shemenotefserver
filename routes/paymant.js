const express = require("express");
const router = express.Router({ mergeParams: true });
const {
	createPaymant,
	PaypalcreatePaymant,
	success,
	createPaymanthyp,
	successhyp
} = require('../handlers/paymant')

// using prefix /api/paymant/:id/create
router.route('/stripe').post(createPaymant)
router.route('/paypal/:receiverid').post(PaypalcreatePaymant)
router.route('/hyp').post(createPaymanthyp)
router.route('/hyp/success').post(successhyp)

module.exports = router;
