'use strict';

const mongoose = require('mongoose');

const donationsSchema = mongoose.Schema({
	name: {
		type: String
	},
	email: {
		type: String
	},
	amountDonated: {
		type: Number
	},
	
});

module.exports = mongoose.model('donations', donationsSchema, 'donations');