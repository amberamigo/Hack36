
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
const app = express();
const _ = require("lodash");


mongoose.connect("mongodb://localhost:27017/hack36DB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

Sndkslsksl

const itemSchema = {
  name : String,
  price : Number,
  img : String
};


const cartSchema = {
  userId : String, 
  productId : String,
  name : String,
  price : Number,
  img : String
};


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret : "our little secret.",
  resave : false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//////////////////////////////////google OAuth ///////////////////////////////////////////////////////

const userSchema = new mongoose.Schema ({
  email : String, 
  password : String,
  googleId : String
});

userSchema.plugin(passportLocalMongoose); 
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());
 
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/secrets",
    proxy: true
  },
  function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ username: profile.emails[0].value, googleId: profile.id, }, function (err, user) {
      return cb(err, user);
    });
  }
));

/////////////-----------------------------//////////////

const AvailableItem = mongoose.model("AvailableItem", itemSchema);
const CartItem = new mongoose.model("CartItem", cartSchema);



app.get("/", function(req, res){
   if(req.isAuthenticated()){
      CartItem.find({userId : req.user.username}, function(err, posts){
         res.render("home", {
 
            posts: posts
       });
         // console.log(req.user.username);

    });
    }else {
      res.redirect("/register");
    }

});



////////////////authentication//////////////////////


app.get('/auth/google', 
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);
app.get("/auth/google/secrets", 
  passport.authenticate("google", { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("/home");
  });

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});
app.get("/home", function(req, res){
    res.redirect("/");
});


app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});



app.post("/register", function(req, res){
     User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/home");
      })
    }
  });
});

app.post("/login", function(req, res){
 const user = new User({
  username : req.body.username,
  password : req.body.password
 });

  req.login(user, function(err){
      if(err){
        res.redirect("/register");
      }else{
       passport.authenticate("local")(req, res, function(){
        res.redirect("/home");
      })
      }
  });
});

/////////////////////////////demo front page ////////////////////////////////////////

app.get("/front-page", function(req, res){
    AvailableItem.find({}, function(err, availableItems){
         res.render("frontPage", {
            availableItems: availableItems
       });
    });
});





///////////////////////////to add item item to cart, send a post req with route "/add-item/postId" ////////// 
app.post("/add-to-cart/:postId", function(req, res) {
   const requestedPostId = req.params.postId;

  CartItem.find({productId : requestedPostId, userId : req.user.username}, function(err, availableItems){
  if(!availableItems.length)
  {
  AvailableItem.findOne({_id : requestedPostId}, function(err, item){
     const newItem = new CartItem({
    userId : req.user.username,
    productId : requestedPostId,
    name: item.name,
    price: item.price,
    img : item.img
  });
     // console.log(req.username);
   newItem.save();
  });
}
});
   res.redirect("/front-page");
});




/////////////////////////----------------------//////////////////////
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});


///google credentials :- https://evening-headland-54486.herokuapp.com/auth/google/secrets

