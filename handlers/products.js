const db = require('../models')
const signature = require('../service/images/signUpload')

const cloudinary = require('cloudinary').v2
require('../service/images/cloudineryCfg')
const cloudName = cloudinary.config().cloud_name
const apiKey = cloudinary.config().api_key

exports.uploadAsset = async (req, res, next) => {
	try {
		const sig = signature.signuploadform()

		res.status(200).json({
			signature: sig.signature,
			timestamp: sig.timestamp,
			cloudname: cloudName,
			apikey: apiKey,
			folder: 'shemen_otef',
			url: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
			upload_preset: 'kp9axy6w'
		})
	} catch (error) {
		next(error)
	}
}

exports.deleteProductById = async (req, res, next) => {
	try {
		const { productId } = req.params
		console.log(productId)
		let foundProduct = await db.Products.findById(productId)

		foundProduct?.images?.map(
			async ({ public_id }) =>
				await cloudinary.uploader.destroy(
					public_id,
					function (error, result) {}
				)
		)
		await db.Products.deleteOne({ _id: productId })

		res.status(200).json(foundProduct)
	} catch (error) {
		next(error)
	}
}
exports.getProductById = async (req, res, next) => {
	try {
		const { productId } = req.params
		let foundProduct = await db.Products.findById(productId)
		res.status(200).json(foundProduct)
	} catch (error) {
		next(error)
	}
}
exports.getAllProductForUsers = async (req, res, next) => {
	let data
	try {
		let searchQuery = req.query?.search
		if (searchQuery) {
			const query = [
				{
					$search: {
						index: 'shemen_otef',
						text: {
							query: searchQuery,
							path: {
								wildcard: '*'
							}
						}
					}
				},
				{
					$match: {
						listed: true,
						availibleForDelivery: true
					}
				}
			]
			data = await db.Products.aggregate(query)
		} else {
			data = await db.Products.find({
				listed: true,
				availibleForDelivery: true
			})
				.populate({ path: 'category', select: 'title' })
				.lean()
		}
		res.status(200).json(data)
	} catch (error) {
		next(error)
	}
}
exports.createProduct = async (req, res, next) => {
	try {
		const foundProduct = await db.Products.findOne({ title: req.body.title })
		if (foundProduct) {
			return next({ message: 'This title is taken try a differnt title' })
		}

		const foundCategory = await db.Categories.findById(
			req.body.categoryid ?? '64359d47009452581a0abe24'
		)
		const data = await db.Products.create({
			...req.body,
			category: foundCategory
		})

		foundCategory.products.push(data)
		await foundCategory.save()
		res.status(201).json(data)
	} catch (error) {
		next(error)
	}
}
exports.getAllProduct = async (req, res, next) => {
	try {
		let data = await db.Products.find()
		res.status(200).json(data)
	} catch (error) {
		next(error)
	}
}

exports.autoCompleate = async (req, res, next) => {
	try {
		let searchQuery = req.query?.search ?? ''

		console.log({ searchQuery })

		const query = [
			{
				$search: {
					index: 'shemen_otef',
					text: {
						query: searchQuery,
						path: {
							wildcard: '*'
						}
					}
				}
			},
			{
				$match: {
					listed: true,
					availibleForDelivery: true
				}
			}
		]

		let data = await db.Products.aggregate(query)
		res.status(200).json(data)
	} catch (error) {
		next(error)
	}
}

exports.editProductById = async (req, res, next) => {
	const productId = req.params.productId
	const { categoryid } = req.body
	const oldProduct = await db.Products.findById(productId)
	const oldCategory = await db.Categories.findById(oldProduct.category)
	try {
		const updatedProduct = await db.Products.findOneAndUpdate(
			{ _id: productId },
			{ ...req.body, category: categoryid },
			{ new: true }
		)
		// deleteing the product from the other category so it wont show on both
		if (oldCategory) {
			oldCategory.products.pull(oldProduct._id)
			await oldCategory.save()
		}
		//checking to see if we already have the product in the category and if not updating category accordingly
		if (categoryid) {
			const foundCategory = await db.Categories.findById(req.body.categoryid)
			if (!foundCategory.products.includes(updatedProduct._id)) {
				foundCategory.products.push(updatedProduct)
				await foundCategory.save()
			}
		}
		res.status(200).json({ product: updatedProduct })
	} catch (error) {
		next(error)
	}
}
