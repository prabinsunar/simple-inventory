const Category = require('../models/category');
const { body, validationResult } = require('express-validator');
const Item = require('../models/item');
const async = require('async');

exports.category_list = (req, res, next) => {
	Category.find().exec((err, categories) => {
		if (err) {
			return next(err);
		}

		res.render('category_list', {
			title: 'This is for categories',
			category_list: categories,
		});
	});
};

exports.category_detail = (req, res, next) => {
	Category.findById(req.params.id).exec((err, category) => {
		if (err) {
			return next(err);
		}

		res.render('category_detail', {
			title: 'Category detail: ' + category._id,
			category,
		});
	});
};

exports.category_create_get = (req, res) => {
	res.render('category_form', {
		title: 'Create Category',
		category: '',
		errors: false,
	});
};

exports.category_create_post = [
	body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
	body('description', 'Description must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	(req, res, next) => {
		const errors = validationResult(req);

		let category = new Category({
			name: req.body.name,
			description: req.body.description,
		});

		if (!errors.isEmpty()) {
			res.render('category_form', {
				title: 'Create Category',
				category,
				errors: errors.array(),
			});
		} else {
			Category.findOne({ name: req.body.name }).exec((err, results_found) => {
				if (err) {
					return next(err);
				}

				if (results_found) {
					res.redirect(results_found.url);
				} else {
					category.save(err => {
						if (err) {
							return next(err);
						}

						res.redirect(category.url);
					});
				}
			});
		}
	},
];

exports.category_delete_get = (req, res, next) => {
	async.parallel(
		{
			category: callback => {
				Category.findById(req.params.id).exec(callback);
			},
			items: callback => {
				Item.find({ category: req.params.id }).exec(callback);
			},
		},
		(err, results) => {
			if (err) {
				return next(err);
			}
			if (results.items) {
				res.render('category_delete', {
					title: 'Delete Category',
					category: results.category,
					items: results.items,
				});
			} else {
				res.render('category_delete', {
					title: 'Delete Category',
					items: false,
					category: results.category,
				});
			}
		}
	);
};

exports.category_delete_post = (req, res, next) => {
	Category.findByIdAndRemove(req.body.categoryid).exec(err => {
		if (err) {
			return next(err);
		}

		res.redirect('/categories');
	});
};

exports.category_update_get = (req, res, next) => {
	Category.findById(req.params.id).exec((err, category) => {
		if (err) {
			return next(err);
		}

		res.render('category_form', {
			title: 'Update Category',
			category,
		});
	});
};

exports.category_update_post = [
	body('name', 'Name must not be empty').trim().isLength({ min: 1 }).escape(),
	body('description', 'Description must not be empty')
		.trim()
		.isLength({ min: 1 })
		.escape(),
	(req, res, next) => {
		const errors = validationResult(req);

		let category = new Category({
			name: req.body.name,
			description: req.body.description,
			_id: req.params.id,
		});

		if (!errors.isEmpty()) {
			Category.findById(req.params.id).exec((err, category) => {
				if (err) {
					return next(err);
				}
				res.render('category_form', {
					title: 'Update Category',
					category,
					errors: errors.array(),
				});
			});
		} else {
			Category.findByIdAndUpdate(
				req.params.id,
				category,
				{},
				(err, category) => {
					if (err) {
						return next(err);
					}

					res.redirect(category.url);
				}
			);
		}
	},
];
