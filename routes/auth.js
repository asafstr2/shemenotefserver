const express = require('express')
const router = express.Router()
const { signup, signin,socialSignIn,getSocials,updateSocials,resetPassword ,changePassword} = require('../handlers/auth')
const { userValidationRules, validate,createUserValidationRules,ensureCorrectUser,loginRequired,validateInviter,ensureCorrectUserForPasswordReset } = require('../midlleware/auth')

router.post('/signup', userValidationRules(), validate,validateInviter, signup)
router.post('/signin/',userValidationRules(), validate,signin)
router.post('/socialsignin/',userValidationRules(), validate,socialSignIn)
router.get('/:id/getsocials', loginRequired,ensureCorrectUser,getSocials)
router.post('/:id/updatesocials', loginRequired,ensureCorrectUser,updateSocials)
router.route('/resetPassword').post(resetPassword).put(ensureCorrectUserForPasswordReset,changePassword)

module.exports = router
