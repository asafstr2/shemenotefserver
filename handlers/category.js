const db = require('../models')

exports.getAllCategories = async (req, res, next) => {
	try {
		let data = await db.Categories.find()
		console.log({ Products: data.products })
		res.status(200).json(data)
	} catch (error) {
		next(error)
	}
}

exports.getAllProductsPerCategory = async (req, res, next) => {
	try {
		const { categoryId } = req.params
		console.log({ categoryId })
		let data = await db.Categories.findById(categoryId).populate('products')
		console.log({ data })
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
