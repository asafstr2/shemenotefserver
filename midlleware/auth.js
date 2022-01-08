const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const db = require('../models')

//insure user logged in-Authentecation
exports.loginRequired = function (req, res, next) {
	//unfortently we must use callback here since verify is not yet promisified
	try {
		//since we are going to use Bearer  <JWT_Token> on the Authorization header we are spliting to get just the JWT token from the header
		const token = req.headers.authorization.split(' ')[1]
		//trying to decode just to see if no one tempered with it and it valid
		jwt.verify(token, process.env.SECRET_KEY, function (err, decode) {
			// since it is a middleware if valid move on
			console.log({ err, decode })
			if (decode) {
				req.user = decode
				return next()
			}
			//else some one probebly try to temper with so return some generic message
			else
				return next({
					status: 401,
					message: 'please log in first'
				})
		})
	} catch (error) {
		return next({
			status: 401,
			message: 'please log in first'
		})
	}
}

//make sure we get the correct user -Authorization
exports.ensureCorrectUser = function (req, res, next) {
	//unfortently we must use callback here since verify is not yet promisified
	try {
		//since we are going to use BARER <JWT_Token> on the Authorization in fetch we are spliting to get just the JWT token from the header
		const token = req.headers.authorization.split(' ')[1]
		//trying to decode just to see if no one tempered with it and it valid
		jwt.verify(token, process.env.SECRET_KEY, function (err, decode) {
			//check to see the JWT user id matches that of the URL user ID "token payload = id, username, profileImageUrl" and URl is /api/users/:id/messeges
			if (decode && decode.id === req.params.id) {
				//attaching the decoded role to req for next middleware
				if (decode.role) {
					req.role = decode.role
				}
				// since it is a middleware if valid move on
				req.user = decode
				return next()
			}
			//else the token id and url id did not match
			else
				return next({
					status: 401,
					message: 'Unauthorize1'
				})
		})
	} catch (error) {
		return next({
			status: 401,
			message: 'Unauthorize2'
		})
	}
}

exports.userValidationRules = () => {
	return [body('email', 'invalid Email').isEmail()]
}
exports.createUserValidationRules = () => {
	return [
		body('password', 'Must contain password longer then 5 char').isLength({
			min: 5
		})
	]
}

exports.validate = (req, res, next) => {
	const errors = validationResult(req)
	if (errors.isEmpty()) {
		return next()
	}
	let extractedErrors = ''
	errors.array().map(err => (extractedErrors += ` ${err.msg},`))
	return next({
		status: 422,
		message: extractedErrors
	})
}

exports.viewOnly = async (req, res, next) => {
	try {
		let user = await db.User.findById(req.user.id)
		if (!user) {
			return next({
				status: 404,
				message: 'no user exists'
			})
		}
		if (!user.roles.includes('readOnly')) return next()
		else
			return next({
				status: 401,
				message: 'user cannot edit please talk to the admin'
			})
	} catch (error) {
		return next({
			status: 401,
			message: 'user cannot edit please talk to the admin',
			error
		})
	}
}

exports.administrator = async (req, res, next) => {
	try {
		let user = await db.User.findById(req.user.id)
		if (user.roles.includes('admin')) return next()
		else
			return next({
				status: 401,
				message: 'admin only route'
			})
	} catch (error) {
		return next({
			status: 401,
			message: 'problem auth',
			error
		})
	}
}

exports.validateInviter = async (req, res, next) => {
	const { invitedBy } = req.body
	if (!invitedBy) return next()
	try {
		const foundUser = await db.User.findById(invitedBy)
		if (foundUser) {
			//need to added 1+ to this user for inviting people
			return next()
		}
		res.status(404).json('the user that invited you does not exists')
	} catch (err) {
		next(err)
	}
}

exports.ensureCorrectUserForPasswordReset = function (req, res, next) {
	//unfortently we must use callback here since verify is not yet promisified

	try {
		const { token } = req.body

		jwt.verify(token, process.env.SECRET_KEY, function (err, decode) {
			if (err) {
				console.log({ err })
			}
			if (decode) {
				db.User.findOne({ email: decode.email }).then(user => {
					if (user.passwordReset === token) {
						if (decode.role) req.role = decode.role
						req.user = user
						return next()
					} else {
						return next({
							status: 401,
							message: 'Unauthorize'
						})
					}
				})
			}
			//else the token id and url id did not match
			else
				return next({
					status: 401,
					message: 'Unauthorize'
				})
		})
	} catch (error) {
		return next({
			status: 401,
			message: 'Unauthorize'
		})
	}
}
