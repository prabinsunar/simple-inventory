const async = require('async');
const { body, validationResult } = require('express-validator');
const Category = require('../models/category');
const Item = require('../models/item');

exports.index = (req, res, next) => {
	res.render('index', { title: 'Home page' });
};

exports.item_list = (req, res, next) => {
	Item.find()
		.populate('category')
		.exec((err, item_list) => {
			if (err) {
				return next(err);
			}
			res.render('item_list', { title: 'This is for items', item_list });
		});
};

exports.item_detail = (req, res, next) => {
	Item.findById(req.params.id)
		.populate('category')
		.exec((err, item) => {
			if (err) {
				return next(err);
			}

			res.render('item_detail', {
				title: 'Item detail' + item._id,
				item,
			});
		});
};

exports.item_create_get = (req, res, next) => {
	Category.find().exec((err, categories) => {
		if (err) {
			return next(err);
		}
		categories.sort((a, b) => {
			let txtA = a.name.toUpperCase();
			let txtB = b.name.toUpperCase();

			return txtA < txtB ? -1 : txtA > txtB ? 1 : 0;
		});
		res.render('item_form', {
			title: 'Create Item',
			item: false,
			categories,
			errors: false,
		});
	});
};

exports.item_create_post = [
	body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
	body('description', 'Description must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('category', 'Category cannot be empty').escape(),
	body('price', 'Price must not be empty')
		.isInt({ min: 0 })
		.withMessage("Can't be below 0."),
	body('number_in_stock', 'Quantity must not be emtpy')
		.isInt({ min: 0 })
		.withMessage("Can't be below zero"),
	(req, res, next) => {
		const errors = validationResult(req);

		let item = new Item({
			name: req.body.name,
			description: req.body.description,
			category: req.body.category,
			price: req.body.price,
			number_in_stock: req.body.number_in_stock,
		});

		if (!errors.isEmpty()) {
			Category.find().exec((err, categories) => {
				if (err) {
					return next(err);
				}

				res.render('item_form', {
					title: 'Create Item',
					item,
					categories,
					errors: errors.array(),
				});
			});
		} else {
			item.save(err => {
				if (err) {
					return next(err);
				}

				res.redirect(item.url);
			});
		}
	},
];

exports.item_delete_get = (req, res, next) => {
	Item.findById(req.params.id).exec((err, item) => {
		if (err) {
			return next(err);
		}
		res.render('item_delete', {
			title: 'Delete Item',
			item,
		});
	});
};

exports.item_delete_post = (req, res, next) => {
	Item.findByIdAndRemove(req.body.itemid).exec(err => {
		if (err) {
			return next(err);
		}

		res.redirect('/items');
	});
};

exports.item_update_get = (req, res, next) => {
	async.parallel(
		{
			item: callback => {
				Item.findById(req.params.id).populate('category').exec(callback);
			},
			categories: callback => {
				Category.find(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			let categories = results.categories;
			categories.sort((a, b) => {
				let txtA = a.name.toUpperCase();
				let txtB = b.name.toUpperCase();

				return txtA < txtB ? -1 : txtA > txtB ? 1 : 0;
			});
			res.render('item_form', {
				title: 'Update Item',
				item: results.item,
				categories,
				errors: false,
			});
		}
	);
};

exports.item_update_post = [
	body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
	body('description', 'Description must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	body('category', 'Category must not be empty').escape(),
	body('price', 'Price must not be empty')
		.isInt({ min: 0 })
		.withMessage("Can't be below zero"),
	body('number_in_stock', 'Quantity must be valid')
		.isInt({ min: 0 })
		.withMessage("Can't be below zero"),
	(req, res, next) => {
		const errors = validationResult(req);

		let item = new Item({
			name: req.body.name,
			description: req.body.description,
			category: req.body.category,
			price: req.body.price,
			number_in_stock: req.body.number_in_stock,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			async.parallel(
				{
					item: callback => {
						Item.findById(req.params.id).populate('category').exec(callback);
					},
					categories: callback => {
						Category.find(callback);
					},
				},
				(err, results) => {
					if (err) {
						return next(err);
					}

					res.render('item_form', {
						title: 'Update Item',
						item: results.item,
						categories: results.categories,
						errors: errors.array(),
					});
				}
			);
		} else {
			Item.findByIdAndUpdate(req.params.id, item, {}, (err, item) => {
				if (err) {
					return next(err);
				}

				res.redirect(item.url);
			});
		}
	},
];
