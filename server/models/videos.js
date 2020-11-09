'use strict';

const mongoose = require('mongoose');

const videosSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	link: {
		type: String,
		required: true,
		unique: true
	},
	description: {
		type: String
	},
	postedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'teacher'
	},
	
}, {
	timestamps: true
});

videosSchema.post('remove', function(doc) {
	
});

module.exports = mongoose.model('videos', videosSchema, 'videos');