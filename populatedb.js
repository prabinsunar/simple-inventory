#! /usr/bin/env node

console.log(
	'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/local_library?retryWrites=true'
);

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async');
var Item = require('./models/item');
var Category = require('./models/category');

var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var items = [];
var categories = [];

function itemCreate(name, description, category, price, number_in_stock, cb) {
	let item = new Item({
		name: name,
		description: description,
		category: category,
		price: price,
		number_in_stock: number_in_stock,
	});

	item.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New Item: ' + item);
		items.push(item);
		cb(null, item);
	});
}

function categoryCreate(name, description, cb) {
	let category = new Category({
		name: name,
		description: description,
	});

	category.save(function (err) {
		if (err) {
			cb(err, null);
			return;
		}
		console.log('New Category: ' + category);
		categories.push(category);
		cb(null, category);
	});
}

function createCategories(cb) {
	async.series(
		[
			function (callback) {
				categoryCreate(
					'Clothes',
					'This category includes different types of consumer range clothes',
					callback
				);
			},
			function (callback) {
				categoryCreate(
					'School',
					'This category includes schools in your community',
					callback
				);
			},
			function (callback) {
				categoryCreate(
					'Food',
					'This category includes different types of food used by the customers',
					callback
				);
			},
			function (callback) {
				categoryCreate(
					'Nationalites',
					'This category includes people of different nationalites',
					callback
				);
			},
			function (callback) {
				categoryCreate(
					'Electronic brands',
					'This category includes different types of consumer range elctronic brands',
					callback
				);
			},
		],
		// optional callback
		cb
	);
}

function createItems(cb) {
	async.parallel(
		[
			function (callback) {
				itemCreate(
					'T-Shirt',
					'A normal T-Shirt',
					categories[0],
					18,
					5,
					callback
				);
			},
			function (callback) {
				itemCreate(
					'Gandaki Boarding School',
					'School based on Pokhara',
					categories[1],
					1800,
					1,
					callback
				);
			},
			function (callback) {
				itemCreate('Apple', 'Green apples', categories[2], 3, 5, callback);
			},
			function (callback) {
				itemCreate(
					'Nepalese',
					'People from the country of Nepal',
					categories[3],
					0,
					0,
					callback
				);
			},
			function (callback) {
				itemCreate(
					'Panasonic',
					'A Japanese brand',
					categories[4],
					18000,
					1,
					callback
				);
			},
		],
		// optional callback
		cb
	);
}

async.series(
	[createCategories, createItems],
	// Optional callback
	function (err, results) {
		if (err) {
			console.log('FINAL ERR: ' + err);
		} else {
			console.log('Items created: ' + items);
		}
		// All done, disconnect from database
		mongoose.connection.close();
	}
);
