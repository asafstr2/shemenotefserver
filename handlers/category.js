const db = require('../models')

exports.getAllCategories = async (req, res, next) => {
	try {
		let data = await db.Categories.find()
		res.status(200).json(data)
	} catch (error) {
		next(error)
	}
}

exports.getAllProductsPerCategory = async (req, res, next) => {
	try {
		const { categoryId } = req.params
		let data = await db.Categories.findById(categoryId)
		res.status(200).json(data)
	} catch (error) {
		next(error)
	}
}

exports.createCategory = async (req, res, next) => {
	try {
		const data = await db.Categories.create({
			...req.body
		})
		res.status(200).json(data)
	} catch (error) {
		next(error)
	}
}
