const db = require('../models')
const jwt = require('jsonwebtoken')
const { sendMail } = require('../service/mailing/mailing')

const userToToken = user => {
	const token = jwt.sign(
		{
			pass: user.password.length,
			id: user.id,
			friendsInvited: user.friendsInvited,
			username: user.username,
			profileImageUrl: user.profileImageUrl,
			role: user.role,
			email: user.email,
			createdAt: user.createdAt
		},
		process.env.SECRET_KEY
	)
	return { token }
}

async function socialSignInPrivate(req, res, next) {
	let user = await db.User.findOne({
		email: req.body.email
	})
	if (!user) {
		return next({
			status: 400,
			message: 'invalid email/password user'
		})
	}

	let password = false
	if (req.body.facebookId) {
		password = await user.comparFacebookId(req.body.facebookId, next)
		if (password == 'empty') {
			return next({
				status: 400,
				message:
					'the user did not registerd with facebook before please login using your credentials and link account'
			})
		}
		if (user?.profileImageUrl?.length <= 1) {
			user.profileImageUrl = req.body.profileImageUrl
			profileImageUrl = req.body.profileImageUrl
			await user.save()
		}
	}

	if (!password && req.body.googleId) {
		password = await user.comparGoogleId(req.body.googleId, next)
		if (password == 'empty') {
			return next({
				status: 400,
				message:
					'the user did not registerd with facebook before please login using your credentials and link account'
			})
		}
		if (user?.profileImageUrl?.length <= 1) {
			;(user.profileImageUrl = req.body.profileImageUrl),
				(profileImageUrl = req.body.profileImageUrl)
			await user.save()
		}
	}
	// if user password matches DB password using the comparePassword method on User Schema
	if (password) {
		//create a token with id username and profile image as payload and secret key from ENV later we will decrypt it to get user data and check if logged in
		//sending all data with token as Json to FE
		return res.status(200).json(userToToken(user))
	} else {
		return next({
			status: 400,
			message: 'invalid email/password '
		})
	}
}

exports.socialSignIn = async (req, res, next) => {
	try {
		socialSignInPrivate(req, res, next)
	} catch (err) {
		return next({
			err,
			status: 400,
			message: 'invalid email/password '
		})
	}
}
exports.signin = async (req, res, next) => {
	try {
		privateSignin(req, res, next)
	} catch (err) {
		return next({
			err,
			status: 400,
			message: 'invalid email/password '
		})
	}
}

async function privateSignin(req, res, next) {
	try {
		let user = await db.User.findOne({
			email: req.body.email
		})
		if (!user) {
			if (process.env.NODE_ENV !== 'production') {
				return next({
					status: 400,
					message: 'no user'
				})
			}
			return next({
				status: 400,
				message: 'invalid email/password'
			})
		}

		// if user password matches DB password using the comparePassword method on User Schema
		if (await user.comparePassword(req.body.password, next)) {
			//create a token with id username and profile image as payload and secret key from ENV later we will decrypt it to get user data and check if logged in

			//sending all data with token as Json to FE
			return res.status(200).json(userToToken(user))
		} else {
			if (process.env.NODE_ENV !== 'production') {
				return next({
					status: 400,
					message: 'invalid password'
				})
			}
			return next({
				status: 400,
				message: 'invalid email/password'
			})
		}
	} catch (err) {
		if (process.env.NODE_ENV !== 'production') {
			return next(err)
		}
		return next({
			status: 400,
			message: 'invalid email/password'
		})
	}
}

////only use to change password inside profile after user logged in
exports.signup = async (req, res, next) => {
	try {
		req.body.email = req.body.email.toLowerCase()
		let isUserExsits = await db.User.findOne({ email: req.body.email })
		if (isUserExsits) {
			if (req.body.social) {
				//compare them to see if match sign in
				socialSignInPrivate(req, res, next)
				return
			} else {
				if (req.body.password.length > 1) {
					privateSignin(req, res, next)
					return
				}
			}
		}
		let user = await db.User.create(req.body)
		if (req.body.invitedBy) {
			let inviterUser = await db.User.findById(req.body.invitedBy)
			inviterUser.friendsInvited.push(user.id)
			await inviterUser.save()
		}

		// let { id, username, profileImageUrl,facebookid,facebook } = user;
		//create a token with id username and profile image as payload and secret key from ENV later we will decrypt it to get user data and check if logged in

		//sending all data with token as Json to FE
		// await sendMail(true, email, 'welcome', 'WELCOME', { user })

		return res.status(200).json(userToToken(user))
	} catch (err) {
		//see what kind of err
		if (err.code === 11000)
			err.message = 'sorry User Name or Email has alredy been taken '
		//if username password already taken respond that  else just send a generic 400
		return next({
			status: 400,
			message: err.message
		})
	}
}

exports.getSocials = async (req, res, next) => {
	try {
		const { id } = req.user
		const user = await db.User.findById(id)
		const socials = {
			facebook: user.facebookId.length > 1,
			google: user.googleId.length > 1
		}
		res.status(200).json(socials)
	} catch (error) {
		next(error)
	}
}

exports.updateSocials = async (req, res, next) => {
	try {
		const { id } = req.user
		const { socials } = req.body
		const user = await db.User.findById(id)
		let socialUpdated = 'none'
		if (socials.facebook) {
			user.facebookId = socials.facebook
			socialUpdated = 'facebook'
		}
		if (socials.google) {
			user.googleId = socials.google
			socialUpdated = 'google'
		}
		await user.save()
		res.status(200).json(socialUpdated)
	} catch (error) {
		next(error)
	}
}

const jwtCreate = async user => {
	const token = await jwt.sign(user, process.env.SECRET_KEY)
	return token
}

exports.resetPassword = async (req, res, next) => {
	try {
		const user = await db.User.findOne({ email: req.body.email })
		let { email, username } = user
		user.passwordReset = await jwtCreate({
			email,
			username,
			random: Math.random()
		})
		await user.save()
		//send email with token for user.password
		await sendMail(false, email, 'resetPassword', 'PASSWORD_RESET', {
			token: user.passwordReset,
			route: process.env.FRONT_BASE_URL,
			compleateRoute: `${process.env.FRONT_BASE_URL}/passwordreset?token=${user.passwordReset}`
		})

		if (process.env.NODE_ENV === 'test') {
			res
				.status(200)
				.json({ pass: user.password.length, token: user.passwordReset })
		} else {
			res.status(200).json({ pass: user.password.length, msg: 'email sent' })
		}
	} catch (error) {
		next(error)
	}
}
exports.changePassword = async (req, res, next) => {
	try {
		if (req.body.password.length < 5) {
			return next({
				status: 400,
				message: 'password must be at least 5 chars'
			})
		}
		const { user } = req
		if (user) {
			user.password = req.body.password
			await user.save()
			res.status(200).json('user password updated')
		} else {
			return next({
				status: 400,
				message: 'user not found'
			})
		}
	} catch (error) {
		next(error)
	}
}
