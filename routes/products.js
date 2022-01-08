const express = require('express')
const router = express.Router({ mergeParams: true })
const {
	deleteProductById,
	getProductById,
	getAllProductForUsers,
	createProduct,
	getAllProduct
} = require('../handlers/products')
const {
	administrator,
	ensureCorrectUser,
	loginRequired
} = require('../midlleware/auth')

// using prefix /api/paymant/:id/create
router
	.route('/:id/foradmin')
	.post(loginRequired, ensureCorrectUser, administrator, createProduct)
	.get(loginRequired, ensureCorrectUser, administrator, getAllProduct)
router.route('/:id/foradmin/:productId').delete(loginRequired, ensureCorrectUser, administrator,deleteProductById)
router.route('/:productId').get(getProductById)
router.route('/').get(getAllProductForUsers)

module.exports = router
