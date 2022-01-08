const router = require('express').Router()

const { contactUs,report } = require('../handlers/contactUs')

router.post(`/:id/contact-us/`, contactUs)
router.post(`/:id/report/`, report)

module.exports = router
