const db = require('../models')
const signature = require('../service/images/signUpload')

const cloudinary = require('cloudinary').v2
require('../service/images/cloudineryCfg')
const cloudName = cloudinary.config().cloud_name
const apiKey = cloudinary.config().api_key

exports.uploadAsset = async (req, res, next) => {
	try {
		const sig = signature.signuploadform()
		console.log({
			signature: sig.signature,
			timestamp: sig.timestamp,
			cloudname: cloudName,
			apikey: apiKey,
			folder: 'shemen_otef',
			url: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
		})
		res.status(200).json({
			signature: sig.signature,
			timestamp: sig.timestamp,
			cloudname: cloudName,
			apikey: apiKey,
			folder: 'shemen_otef',
			url: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
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
		await foundProduct.remove()

		res.status(200).json(foundProduct)
	} catch (error) {
		next(error)
	}
}
exports.getProductById = async (req, res, next) => {
	try {
		const { productId } = req.params
		const data = await db.Products.findById(productId)
		res.status(200).json(data)
	} catch (error) {
		next(error)
	}
}
exports.getAllProductForUsers = async (req, res, next) => {
	let data
	try {
		let searchQuery = req.query?.search
		if (searchQuery) {
			let requestedFields = req.query?.fields?.split(',') ?? []
			let primeryFieldToSearch = req.query.primery ?? 'title'
			let seconderyFieldsToSearch = req.query?.secondery?.split(',') ?? [
				'description',
				'otherLanguageTitle.hebrew'
			]
			let projectedFields = { description: 1, 'otherLanguageTitle.hebrew': 1 }
			requestedFields.forEach(filed => {
				projectedFields[filed] = 1
			})
			const query = [
				{
					$search: {
						compound: {
							should: [
								{
									text: {
										query: searchQuery,
										path: primeryFieldToSearch,
										fuzzy: {
											maxEdits: 2
										},
										score: {
											boost: {
												value: 5
											}
										}
									}
								},
								{
									text: {
										query: searchQuery,
										path: seconderyFieldsToSearch,
										fuzzy: {
											maxEdits: 2
										}
									}
								}
							]
						}
					}
				},
				{
					$match: {
						listed: true,
						availibleForDelivery: true
					}
				},
				{
					$project: {
						title: 1,
						score: {
							$meta: 'searchScore'
						},
						...projectedFields
					}
				}
			]
			data = await db.Products.aggregate(query)
		} else {
			data = await db.Products.find({
				listed: true,
				availibleForDelivery: true
			}).lean()
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
		const data = await db.Products.create({ ...req.body })
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
		let requestedFields = req.query?.fields?.split(',') ?? []
		let primeryFieldToSearch = req.query.primery ?? 'otherLanguageTitle.default'
		let projectedFields = {
			description: 1,
			'otherLanguageTitle.hebrew': 1,
			'otherLanguageTitle.default': 1
		}
		requestedFields.forEach(filed => {
			projectedFields[filed] = 1
		})
		console.log({ searchQuery })

		const agg = [
			{
				$search: {
					compound: {
						should: [
							{
								autocomplete: {
									query: searchQuery,
									path: primeryFieldToSearch
								}
							},
							{
								autocomplete: {
									query: searchQuery,
									path: 'title'
								}
							},
							{
								autocomplete: {
									query: searchQuery,
									path: 'otherLanguageTitle.hebrew'
								}
							}
						],
						minimumShouldMatch: 1
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

		let data = await db.Products.aggregate(agg)
		console.log({ data })
		res.status(200).json(data)
	} catch (error) {
		next(error)
	}
}
