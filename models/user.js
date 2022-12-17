var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");


var userSchema = mongoose.Schema({
	username : String,
	password : String,
	bookmarkCollection :[
		{
			type : mongoose.Schema.Types.ObjectId,
			ref: "Product"
		}
	],
	bookmarkStatus: Boolean,
	cart :[
		{
			type : mongoose.Schema.Types.ObjectId,
			ref: "Product"
		}
	],
	secretToken: String,
	active: Boolean
});

// userSchema.statics.findOrCreate = function findOrCreate(profile, cb){
//     var userObj = new this();
//     this.findOne({_id : profile.id},function(err,result){ 
//         if(!result){
//             userObj.username = profile.displayName;
//             //....
//             userObj.save(cb);
//         }else{
//             cb(err,result);
//         }
//     });
// };

userSchema.plugin(passportLocalMongoose);
//userSchema.plugin(GoogleStrategy);

module.exports = mongoose.model("User", userSchema);