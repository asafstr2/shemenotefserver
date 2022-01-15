const db = require('../models')
const signature = require('../service/images/signUpload');

const cloudinary = require('cloudinary').v2
require('../service/images/cloudineryCfg')
const cloudName = cloudinary.config().cloud_name;
const apiKey = cloudinary.config().api_key;

exports.uploadAsset = async (req, res, next) => {
	try {
		const sig = signature.signuploadform()
		res.json({
			signature: sig.signature,
			timestamp: sig.timestamp,
			cloudname: cloudName,
			apikey: apiKey,
			folder:shemenotef,
			url: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
		})
	} catch (error) {
		next(error)
	}
}

exports.deleteProductById = async (req, res, next) => {
	try {
		const { productId } = req.params
		const data = await db.Products.findByIdAndDelete(productId)
		res.status(200).json(data)
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
	try {
		let data = await db.Products.find({
			listed: true,
			availibleForDelivery: true
		}).lean()
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
