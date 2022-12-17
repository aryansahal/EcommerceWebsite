var mongoose = require("mongoose");
const path = require("path");
const productImageBasePath="uploads/productImages";

var productSchema = new mongoose.Schema({
	name: String,
	category: String,
	actualPrice: Number,
	discPrice: Number,
	quantity: Number,
	productTotal: Number,
	imgBig: String,
	imgs1: String,
	imgs2: String,
	imgs3: String,
	description: String,
	// imageC: String,
	// imageNc: String,
	likes: Number,
	author: {
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	],
	likedUsers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	],
	//  productImageNameChina: {
	// type: String,
	// },
	// productImageNameIndia: {
	// type: String,
	// },
	likeStatus: Boolean,
	
	
});



productSchema.virtual('productImagePathIndia').get(function() {
  if (this.productImageNameIndia != null) {
    return path.join('/', productImageBasePath, this.productImageNameIndia)
  }
})

productSchema.virtual('productImagePathChina').get(function() {
  if (this.productImageNameChina != null) {
    return path.join('/', productImageBasePath, this.productImageNameChina)
  }
})

var Product = mongoose.model("Product", productSchema);
module.exports = Product;
module.exports.productImageBasePath = productImageBasePath;



