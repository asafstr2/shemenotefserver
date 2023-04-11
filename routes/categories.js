const express = require('express')
const router = express.Router({ mergeParams: true })
const {
	createCategory,
	getAllCategories,
	getAllProductsPerCategory
} = require('../handlers/category')
const {
	administrator,
	ensureCorrectUser,
	loginRequired
} = require('../midlleware/auth')

//pre fix /api/categories/
router
	.route('/:id/foradmin')
	.post(loginRequired, ensureCorrectUser, administrator, createCategory)

router.route('/:categoryId').get(getAllProductsPerCategory)
router.route('/').get(getAllCategories)

module.exports = router
