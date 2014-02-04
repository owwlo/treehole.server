var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var GoogleUserSchema = new Schema({
	identifier: String,
	displayName :  String,
	email: String,
	createDate: Date
});

module.exports = mongoose.model('GoogleUser', GoogleUserSchema);