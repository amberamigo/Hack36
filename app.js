
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
const nodeMailer = require('nodemailer');
const _ = require("lodash");




mongoose.connect("mongodb+srv://amigo_blog:Test123@cluster0.dbkp6.mongodb.net/hack36DB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);
// mongoose.set("debug",true);



const itemSchema = {
  name : String,
  price : Number,
  img : String,
<<<<<<< HEAD
  mail : String,
  availableAt : String
=======
  availableAt : Date
>>>>>>> 2dcd33683d1156c4ef395be129a0a1723252f9f2
};


const cartSchema = {
  userId : String, 
  productId : String,
  name : String,
  price : Number,
  img : String,
  mail : String,
  availableAt : Number
};


const serviceSchema = {
  userId : String, 
  productId : String,
  name : String,
  price : Number,
  img : String,
  mail : String,
  availableAt : Number,
  isComppleted : Boolean
};


const serviceRequestSchema = {
  userId : String,
  productId : String,
  timeAlloted : Date,
  isCompleted : Boolean,
  passcode : Number
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
<<<<<<< HEAD
const ServiceItem = new mongoose.model("ServiceItem", serviceSchema);


const homeStartingContent = "My Cart";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";



=======
const ServiceRequestItem = mongoose.model("ServiceRequestItem", serviceRequestSchema);
>>>>>>> 2dcd33683d1156c4ef395be129a0a1723252f9f2


app.get("/", function(req, res){
   if(req.isAuthenticated()){
      CartItem.find({userId : req.user.username}, function(err, posts){
         res.render("home", {
            startingContent: homeStartingContent,
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


//////////////////////////////////////////removing a post////////////////////////////////////////////////
app.get("/delete/:postId", function(req, res){
    const post = req.params.postId;
      CartItem.findOneAndDelete({_id : post, userId : req.user.username}, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
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


///////////////------------------------------//////////////




app.get("/about", function(req, res){
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", function(req, res){
  res.render("contact", {contactContent: contactContent});
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const availableItem = new AvailableItem({
    name: req.body.postTitle,
    price: req.body.postBody,
    img : req.body.postImage,
    mail : req.body.postMail,
    availableAt : new Date().getHours()
  });

   availableItem.save();
   res.redirect("/front-page");
 });

app.get("/posts/:postId", function(req, res){
  const requestedPostId = req.params.postId;

  AvailableItem.findOne({_id : requestedPostId}, function(err, post){
     res.render("post", {
        title : post.title,
        content : post.content
     });
  });
  // posts.forEach(function(post){
  //   const storedTitle = _.lowerCase(post.title);

  //   if (storedTitle === requestedTitle) {
  //     res.render("post", {
  //       title: post.title,
  //       content: post.content
  //     });
  //   }
  // });

});


////////////////////////////////// services ordered ///////////////////////////////////////////
app.get("/orders", function(req, res){
   if(req.isAuthenticated()){
      ServiceItem.find({userId : req.user.username}, function(err, posts){
         res.render("orders", {
            userOrders : posts
       });
         // console.log(req.user.username);
    });
    }else {
      res.redirect("/register");
    }

});

////////////////////////////// successfully orderd ///////////////////////////////////////////
app.get("/success", function(req, res){

         CartItem.find({userId : req.user.username}, function(err, cartItems){
          cartItems.forEach(function(item){

         let slot = Math.max(item.availableAt, new Date().getHours());

         if(slot < 10 || slot > 20)
          slot=10;

             const newItem = new ServiceItem({
                               userId : req.user.username,
                               productId : item.productId,
                               name: item.name,
                               price: item.price,
                               img : item.img, 
                               mail : item.mail,
                               availableAt : slot
                          });

              newItem.save();


          AvailableItem.findOneAndUpdate({_id : item.productId},{availableAt: slot+1},function (err, docs) {
             if (err){
               console.log(err)
            }else{
                console.log("Available : ");
             }
             console.log("changing");
           });
             
             });
           });

         
         CartItem.deleteMany({ userId : req.user.username}, function (err) {
                if(err) 
                  console.log(err);
                else
                  console.log("Successful deletion");
               });
    

           res.redirect("/orders");
});




/////////////////////////////demo front page ////////////////////////////////////////

app.get("/front-page", function(req, res){
    AvailableItem.find({}, function(err, availableItems){
         res.render("frontPage", {
            availableItems: availableItems
       });
    });
});


app.get("/front", function(req, res){
         res.render("front");
});


///////////////////////////////////////////////////to add item item to cart, send a post req with route "/add-item/postId" ////////// 
app.post("/add-to-cart/:postId", function(req, res) {
   const requestedPostId = req.params.postId;
<<<<<<< HEAD
     if(req.isAuthenticated()){
         CartItem.find({productId : requestedPostId, userId : req.user.username}, function(err, availableItems){
           if(!availableItems.length)
           {
            AvailableItem.findOne({_id : requestedPostId}, function(err, item){
             const newItem = new CartItem({
                               userId : req.user.username,
                               productId : requestedPostId,
                               name: item.name,
                               price: item.price,
                               img : item.img, 
                               mail : item.mail,
                               availableAt : item.availableAt
                             });
            newItem.save();
           });
        }
    });
  
  res.redirect("/front-page");
  }
  else{
    res.redirect("/login");
  }
=======

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
>>>>>>> 2dcd33683d1156c4ef395be129a0a1723252f9f2
});




/* Checking out cart by sending post request to "/checkOutCart" */
app.post("/checkOutCart", (request, response)=>{

    CartItem.find({userId : req.user.username}, (err, data)=>{
      if(err==null && data.length>0){
        data.forEach(element => {
          ServiceRequestItem.findOne({userId : element.userId, productId : element.productId}, (err,data)=>{
            if(err==null && data==null){
              var randomPassCode = Math.floor(Math.random()*9000)+1000;
              
              const serviceRequest = new ServiceRequestItem({
                userId : element.userId,
                productId : element.productId,
                isCompleted : false,
                passcode : randomPassCode,
                timeAlloted : element.availableAt
              });
              serviceRequest.save();

              var serviceManEmail = '';
              var serviceManAvailableAt = new Date().getTime();

              AvailableItem.findOne({productId : element.productId}, (err, productData)=>{
                if(err==null && productData!=null){
                  serviceManEmail = productData.email,
                  serviceManAvailableAt = productData.availableAt
                }
              });

              var transporter = nodeMailer.createTransport({
                service : 'gmail',
                auth : {
                  user : '',
                  pass : ''
                }
              });

              var mailToUser = {
                from : '',
                to : element.email,
                subject : 'Service Booking Confirmation',
                text : `Service Booked 
                        Time : `+serviceManAvailableAt+`
                        Passcode :`+randomPassCode
              }

              var mailToServiceMan = {
                from : '',
                to : serviceManEmail,
                subject : 'New Service Booking',
                text : `Booking At : `+serviceManAvailableAt 
              }

              transporter.sendMail(mailToServiceMan, (err,info)=>{
                
              });

              transporter.sendMail(mailToUser, (err,info)=>{

              });

            }
          });
        });
      }
    });

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

