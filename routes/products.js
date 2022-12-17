var express = require("express");
var router = express.Router();
var Product = require("../models/product");
var middleware = require("../middleware") ;//by default index.js file is acquired if nothing is mentioned
const multer = require("multer");
const path=require("path");
var fs = require('fs');
//const fs = require('fs')
const uploadPath =  path.join('public', Product.productImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

//CONTACT PAGE ROUTE
router.get("/contact", function(req, res){
	res.render("products/contact");
});

//INDEX - Show all products
router.get("/",function(req, res){
	var menProducts=[];
	var womenProducts=[];
	var kidsProducts=[];
	Product.find({category:"Men"}, function(err, MenProducts){
		if(err){
			console.log(err);
		}else{
			menfunc(MenProducts);
		}
	});
	Product.find({category:"Women"}, function(err, WomenProducts){
		if(err){
			console.log(err);
		}else{
			womenfunc(WomenProducts);
		}
	});
	Product.find({category:"Kids"}, function(err, KidsProducts){
		if(err){
			console.log(err);
		}else{
			kidsfunc(kidsProducts);
		}
	});
	function menfunc(product){
		menProducts=product;
	}
	function womenfunc(product){
		womenProducts=product;
	}
	function kidsfunc(product){
		kidsProducts=product;
		res.render("products/index",{menProducts : menProducts, womenProducts : womenProducts, kidsProducts : kidsProducts});
	}
	
});

//CREATE - add new product to DB
router.post("/", middleware.isAdmin, upload.fields([{name: "productChina"}, {name: "productIndia"}]) , function(req, res){
	
	var name = req.body.name;
	var imgBig = req.body.imgBig;
	var imgs1 = req.body.imgs1;
	var imgs2 = req.body.imgs2;
	var imgs3 = req.body.imgs3;
	var description = req.body.description;
	var category = req.body.category;
	var actualPrice = req.body.actualPrice;
	var discPrice = req.body.discPrice;
	var quantity = 1;
	var productTotal = discPrice;
	var author={
		id: req.user._id,
		username: req.user.username
	}
	// const fileNameIndia = req.files.productIndia != null ? req.files.productIndia[0].filename : null;
	// const fileNameChina = req.files.productChina != null ? req.files.productChina[0].filename : null;
	// var imageC = req.body.imageC;
	// var imageNc = req.body.imageNc;
	// var productImageNameChina = fileNameChina;
	// var productImageNameIndia = fileNameIndia;
	
	var newProduct = {name : name, likes : 0, author : author, imgBig : imgBig, imgs1 : imgs1, imgs2 : imgs2, imgs3 : imgs3, description : description, category : category, actualPrice : actualPrice, discPrice : discPrice, quantity : quantity, productTotal : productTotal};
	//Create a new product and save to DB
	Product.create(newProduct, function(err,newlyCreated){
		if(err){
			console.log(err);
		}else{
			res.redirect("/products");
		}
	});	
});

//NEW - Show form to create new product
router.get("/new", middleware.isAdmin ,  upload.fields([{name: "productChina"}, {name: "productIndia"}])  , function(req, res){
	res.render("products/new")
});

//MEN PRODUCTS 
router.get("/men",function(req, res){
	Product.find({category:"Men"}, function(err, menProducts){
		if(err){
			console.log(err);
		}else{
			res.render("products/men", {menProducts : menProducts});
		}
	});
});	

//WOMEN PRODUCTS 
router.get("/women",function(req, res){
	Product.find({category:"Women"}, function(err, womenProducts){
		if(err){
			console.log(err);
		}else{
			res.render("products/women", {womenProducts : womenProducts});
		}
	});
});	

//KIDS PRODUCTS 
router.get("/kids",function(req, res){
	Product.find({category:"Kids"}, function(err, kidsProducts){
		if(err){
			console.log(err);
		}else{
			res.render("products/kids", {kidsProducts : kidsProducts});
		}
	});
});	

//SHOP ROUTE
router.get("/shop", function(req, res){
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Product.find({$or:[
        {name:{"$in":[regex]}},
        {description:{"$in":[regex]}}
    ]}, function(err, allProducts){
			if(err){
				console.log(err);
			}else{
				if(allProducts.length < 1)
					{
						req.flash("error", "No Product matches your search. Try Something Else");
						return res.redirect("back");
					}
				res.render("products/shop", {allProducts : allProducts});
			}
		});
	}else{
		Product.find({}, function(err, allProducts){
			if(err){
				console.log(err);
			}else{
				res.render("products/shop", {allProducts : allProducts});
			}
		});
	}
});

//CHECKOUT PAGE
router.post("/:user_id/checkout", middleware.isLoggedIn, function(req, res){
	var cartProducts=[];
	if(req.user.cart.length != 0){
		for(var i=0;i<req.user.cart.length;i++){
		Product.findById(req.user.cart[i], function(err, foundProduct){
			if(err){
			console.log(err);
			}else{
				pushfunc(foundProduct);
			}
		})
	}
	function pushfunc(foundProduct){
		cartProducts.unshift(foundProduct);
		if(cartProducts.length == req.user.cart.length){
			renderfunc(cartProducts)
		}
	}
	}else{
		cartProducts = null;
		renderfunc(cartProducts);
	}
	
	function renderfunc(cartProducts){
		res.render("products/checkout", {cartProducts : cartProducts, subTotal : req.body.subTotal, cartTotal : req.body.cartTotal});
	}
});

//SHOWS more info about one Product
router.get("/:id", function(req, res){
	Product.findById(req.params.id).populate("comments").exec(function(err, foundProduct){
		if(err){
			console.log(err);
		}else{
			if(req.user != null){
				for(var i =0;i<foundProduct.likedUsers.length; i++){
					if(foundProduct.likedUsers[i] == req.user.id){
						foundProduct.likeStatus = true;
						break;
					}else{
						foundProduct.likeStatus = false;
					}
				}
			}
			res.render("products/show",{product: foundProduct});
		}
	})	
});

//EDIT PRODUCT ROUTE
router.get("/:id/edit", upload.fields([{name: "productChina"}, {name: "productIndia"}]), middleware.checkProductOwnership, function(req, res){
	Product.findById(req.params.id, function(err, foundProduct){
	res.render("products/edit", {product : foundProduct});
	});
});

//UPDATE PRODUCT ROUTE
router.put("/:id", upload.fields([{name: "productChina"}, {name: "productIndia"}]), middleware.checkProductOwnership, function(req, res){
	//find and update the correct product 

	var name = req.body.name;
	var imgBig = req.body.imgBig;
	var imgs1 = req.body.imgs1;
	var imgs2 = req.body.imgs2;
	var imgs3 = req.body.imgs3;
	var description = req.body.description;
	var category = req.body.category;
	var actualPrice = req.body.actualPrice;
	var discPrice = req.body.discPrice;
	var productTotal = discPrice;
	var quantity = 1;
	var author={
		id: req.user._id,
		username: req.user.username
	}
	// const fileNameIndia = req.files.productIndia != null ? req.files.productIndia[0].filename : null;
	// const fileNameChina = req.files.productChina != null ? req.files.productChina[0].filename : null;
	// var imageC = req.body.imageC;
	// var imageNc = req.body.imageNc;
	// var productImageNameChina = fileNameChina;
	// var productImageNameIndia = fileNameIndia;
	
	var updatedProduct = {name : name, likes : 0, author : author, imgBig : imgBig, imgs1 : imgs1, imgs2 : imgs2, imgs3 : imgs3, description : description, category : category, actualPrice : actualPrice, discPrice : discPrice, quantity: quantity, productTotal : productTotal};
	
	Product.findByIdAndUpdate(req.params.id, updatedProduct, function(err, updatedProduct){
		if(err){
			res.redirect("/products");
		}else{
			//and redirect somewhere
			res.redirect("/products/" + req.params.id);
		}
	})
});

//DESTROY PRODUCT ROUTE
router.delete("/:id", middleware.checkProductOwnership, function(req, res){
	var fileName;
	Product.findById(req.params.id, function(err, product){
		if(err){
			console.log(err);
		}else{
			const fileNameIndia = product.productImageNameIndia;
			const fileNameChina = product.productImageNameChina;
			const removePathIndia = path.join(uploadPath, String(fileNameIndia));
			console.log(removePathIndia);
			fs.unlink(removePathIndia, err =>{
			if(err) console.log(err)
			});
			const removePathChina = path.join(uploadPath, String(fileNameChina));
			fs.unlink(removePathChina, err =>{
			if(err) console.log(err)
			});
		}
	})
	
	Product.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/products");
		}else{
			res.redirect("/products");
		}
	});
});

//LIKE ROUTE
// router.post('/:id/like/:action', middleware.isLoggedIn, (req, res, next) => {
// 		var counter;
// 		if(req.params.action ==="Like"){
// 			counter =1;
// 			Product.findById(req.params.id, function(err, foundProduct){
// 			if(err){
// 				console.log(err);
// 			}else{
// 				foundProduct.likedUsers.push(req.user.id);
// 				foundProduct.save();
// 				foundProduct.likeStatus= true;
// 			}
// 			});
			
// 		}else if(req.params.action ==="Liked"){
// 			counter=-1;
// 			Product.findById(req.params.id, function(err, foundProduct){
// 			if(err){
// 				console.log(err);
// 			}else{
// 				for(var i =0;i<foundProduct.likedUsers.length; i++){
// 					if(foundProduct.likedUsers[i] == req.user.id){
// 						foundProduct.likedUsers.splice(i, 1);
// 						foundProduct.save();
// 						foundProduct.likeStatus= false;
// 						break;
// 					}
// 				}
// 			}
// 			});
// 		}else{
// 			counter=0;
// 		}
//         Product.update({_id: req.params.id}, {$inc: {likes: counter}}, {}, (err, numberAffected) => {
//             res.send('');
//         });
// 	 });	

//BOOKMARK ROUTE
router.post('/:id/bookmark/:action',middleware.isLoggedIn, (req, res, next) => {
	if(req.params.action == "Bookmarked"){
			req.user.bookmarkCollection.unshift(req.params.id);
			req.user.save();
			req.user.bookmarkStatus = true;
		}else if(req.params.action == "Bookmark"){
			for(var i=0;i<req.user.bookmarkCollection.length; i++){
				if(req.user.bookmarkCollection[i] == req.params.id){
					req.user.bookmarkCollection.splice(i,1);
					req.user.save();
					req.user.bookmarkStatus = false;
				}
			}
		}else{}
     });	

//BOOKMARK PAGE SHOW REQUEST	
router.get("/:user_id/bookmark",middleware.isLoggedIn, function(req, res){
	
	var bookmarkedProducts=[];
	if(req.user.bookmarkCollection.length != 0){
		for(var i=0;i<req.user.bookmarkCollection.length;i++){
		Product.findById(req.user.bookmarkCollection[i], function(err, foundProduct){
			if(err){
			console.log(err);
			}else{
				pushfunc(foundProduct);
			}
		})
	}
	function pushfunc(foundProduct){
		bookmarkedProducts.unshift(foundProduct);
		if(bookmarkedProducts.length == req.user.bookmarkCollection.length){
			renderfunc(bookmarkedProducts)
		}
	}
	}else{
		bookmarkedProducts = null;
		renderfunc(bookmarkedProducts);
	}
	
	function renderfunc(bookmarkedProducts){
		res.render("products/bookmark", {bookmarkedProducts : bookmarkedProducts});
	}
});

//ADD TO CART ROUTE
router.post('/:id/cart/:action',middleware.isLoggedIn, (req, res, next) => {
	if(req.params.action == "AddToCart"){
			req.user.cart.unshift(req.params.id);
			req.user.save();
		}else if(req.params.action == "RemoveFromCart"){
			for(var i=0;i<req.user.cart.length; i++){
				if(req.user.cart[i] == req.params.id){
					req.user.cart.splice(i,1);
					req.user.save();
					res.redirect("back");
				}
			}	
		}else{}
     });

//CHANGE QUANTITY IN VIEW CART
router.post('/:id/cart/changeQuantity/:quantity',middleware.isLoggedIn, (req, res, next) => {
	Product.findById(req.params.id, function(err, product){
		if(err){
			console.log(err);
		}else{
			product.quantity = req.params.quantity;
			product.productTotal = req.params.quantity * product.discPrice;
			product.save();
		}
	})	
});

//ADD TO CART PAGE SHOW REQUEST	
router.get("/:user_id/cart",middleware.isLoggedIn, function(req, res){
	
	var cartProducts=[];
	if(req.user.cart.length != 0){
		for(var i=0;i<req.user.cart.length;i++){
		Product.findById(req.user.cart[i], function(err, foundProduct){
			if(err){
			console.log(err);
			}else{
				pushfunc(foundProduct);
			}
		})
	}
	function pushfunc(foundProduct){
		cartProducts.unshift(foundProduct);
		if(cartProducts.length == req.user.cart.length){
			renderfunc(cartProducts)
		}
	}
	}else{
		cartProducts = null;
		renderfunc(cartProducts);
	}
	
	function renderfunc(cartProducts){
		res.render("products/cart", {cartProducts : cartProducts});
	}
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;