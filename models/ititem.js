//var crypto = require('crypto');

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ItItemSchema = new Schema({
	id: ObjectId,
	time:  Date,
	deviceId: String,
	lon: String,
	lat:   String,
	content: String,
	isFound: Boolean,
	lon5 : String,
	lat3 : String,
	hidden: Boolean,
	foundBy: String
});

module.exports = mongoose.model('ItItem', ItItemSchema);