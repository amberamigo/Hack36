
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
const fs = require("fs");
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const _ = require("lodash");




mongoose.connect("mongodb+srv://amigo_blog:Test123@cluster0.dbkp6.mongodb.net/hack36DB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);




const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;


////////////////////////// for gmail api ///////////////////////////////
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });



///////////////////////////////// mail format ///////////////////////////////


async function sendMailUser(userMail, passCode, itemName, TimeSlot) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'himanshu180599@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: 'Bugs and Thugs 😁 <himanshu180599@gmail.com>',
      to: userMail,
      subject: 'Hey, Thanks for using our service',
      text: 'Hello from bugs and thugs. Your service for ' + 'itemName' + ' is scheduled at ' + TimeSlot + '. Please give the code ' + passCode + 'only after service completion.',
      html: `<h1>Hello from Bugs and Thugs</h1> <h3> Your service for ` + itemName +  ` is scheduled at ` + TimeSlot + `. <br> Please give the code ` + passCode + ` only after service completion.</h3>`,
    };
   

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}




async function sendMailService(serviceMail, serviceId, TimeSlot) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'himanshu180599@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    
    const mailOptions = {
      from: 'Bugs and Thugs 😁 <himanshu180599@gmail.com>',
      to: 'himanshu.singh18599@gmail.com',
      subject: 'Hello service from Bugs and thugs',
      text: 'Hello from bugs and thugs email using API',
      html: `<h1> Hey, There's a request for your service at ` + TimeSlot + ` </h1> <h3>Enter the passCode on the below link, provided by the user only after completion of service </h3> https://wishmasters.herokuapp.com/verifyPasscodePage#serviceId=` + serviceId
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}
///////////////////////////////-----------------------------------///////////////////////////


const itemSchema = {
  name : String,
  price : Number,
  img : String,
  email : String,
  availableAt : Date
};


const cartSchema = {
  userId : String, 
  productId : String,
  name : String,
  price : Number,
  img : String,
  email : String,
  availableAt : Date
};


const serviceSchema = {
  userId : String, 
  productId : String,
  name : String,
  price : Number,
  img : String,
  email : String,
  availableAt : Date,
  isCompleted : Boolean,
  passCode : Number
 };
// =======
// };


// // const serviceSchema = {
// //   userId : String, 
// //   productId : String,
// //   name : String,
// //   price : Number,
// //   img : String,
// //   mail : String,
// //   availableAt : Number,
// //   isComppleted : Boolean
// // };
// >>>>>>> 26c4937e8d171d58c26d6a67c78e10e33465f9f9


// const serviceRequestSchema = {
//   userId : String,
//   productId : String,
//   timeAlloted : Date,
//   isCompleted : Boolean,
//   passcode : Number
// };


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

const ServiceItem = new mongoose.model("ServiceItem", serviceSchema);


const homeStartingContent = "My Cart";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";




///////////////////////////// front page ////////////////////////////////////////
app.get("/", function(req, res){
         let isLoggedIn = false;

         if(req.isAuthenticated()){
          isLoggedIn = true;
         }
         res.render("front", {userLoggedIn : isLoggedIn});
});



// app.get("/", function(req, res){
//     AvailableItem.find({}, function(err, availableItems){
//          res.render("frontPage", {
//             availableItems: availableItems
//        });
//     });
// });



app.get("/cart", function(req, res){
   if(req.isAuthenticated()){
      CartItem.find({userId : req.user.username}, function(err, posts){
         res.render("cart", {
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

app.get("/verifyPasscodePage", (req,res)=>{
  res.render("verifyPasscodePage");
});

app.post("/verify", (req,res)=>{
  if(req.body.serviceId && req.body.passcode){
    ServiceItem.findOne({_id : req.body.serviceId}, (err,data)=>{
      if(!err){
        if(data.passCode.toString() === req.body.passcode.toString()){
          ServiceItem.findOneAndUpdate({_id : req.body.serviceId}, { isCompleted : true}, (err,info)=>{
            if(!err){
              console.log('Service Request Fulfilled');
            }
          })
        }
      }
    });
  }
  res.redirect("/");
});



//////////////////////////////////////////removing a post////////////////////////////////////////////////
app.get("/delete/:postId", function(req, res){
    const post = req.params.postId;
      CartItem.findOneAndDelete({_id : post, userId : req.user.username}, async function(err){
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
  res.render("about");
});

app.get("/contact", function(req, res){
  res.render("contact");
});

app.get("/services", function(req, res){
  AvailableItem.find({}, function(err, availableItems){
         res.render("services", {
            availableItems: availableItems
       });
    });
});

app.get("/compose", function(req, res){
  res.render("compose");
});

app.post("/compose", function(req, res){
  const availableItem = new AvailableItem({
    name: req.body.postTitle,
    price: req.body.postBody,
    img : req.body.postImage,
    email : req.body.postMail,
    availableAt : new Date(),

  });

   availableItem.save();
   res.redirect("/");
 });



////////////////////////////////// services ordered ///////////////////////////////////////////
app.get("/orders", function(req, res){
   if(req.isAuthenticated()){
      ServiceItem.find({userId : req.user.username}, function(err, serviceRequests){
         res.render("orders", {
            userOrders : serviceRequests
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

         // let slot = Math.max(item.availableAt, new Date());
         let availability = item.availableAt;
         let availabilityms = new Date(item.availableAt).getTime();

         let slot = new Date();
         let slotms = new Date().getTime();
 
         let finalTime = slot;

         if(slotms < availabilityms){
          finalTime = availability;
         }

         if(finalTime.getHours() < 9 || finalTime.getHours > 20){
            var currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + 1);
            currentDate.setHours(9);
            console.log(currentDate);
         }


         slot = finalTime;

         // if(slot < 10 || slot > 20)
         //  slot=10;
          var randomPassCode = Math.floor(Math.random()*9000)+1000;
             const newItem = new ServiceItem({
                               userId : req.user.username,
                               productId : item.productId,
                               name: item.name,
                               price: item.price,
                               img : item.img, 
                               email : item.email,
                               isCompleted : false,
                               availableAt : slot,
                               passCode : randomPassCode
                          });



              // await newItem.save();

               let serviceItemId = 1;

              newItem.save().then(savedDoc => {
                serviceItemId = savedDoc._id;


                  
                 sendMailService(item.email, serviceItemId, slot.toLocaleTimeString('en-US'))
                 .then((result) => console.log('Email sent...', result))
                 .catch((error) => console.log(error.message));


                });

             

              // ServiceItem.find({userId : req.user.username, productId : item.productId}, function(err, item){
              //    serviceItemId = 
              // });
             
              // console.log(serviceItemId);

                

              sendMailUser(req.user.username, randomPassCode, item.name, slot.toLocaleTimeString('en-US'))
                 .then((result) => console.log('Email sent...', result))
                 .catch((error) => console.log(error.message));

             

          AvailableItem.findOneAndUpdate({_id : item.productId},{availableAt : new Date(new Date().getTime()+3600000)},function (err, docs) {
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








///////////////////////////////////////////////////to add item item to cart, send a post req with route "/add-item/postId" ////////// 
app.post("/add-to-cart/:postId", function(req, res) {
   const requestedPostId = req.params.postId;

     if(req.isAuthenticated()){
         CartItem.find({productId : requestedPostId, userId : req.user.username}, function(err, availableItems){
           if(!availableItems.length)
           { 
             AvailableItem.findOne({_id : requestedPostId}, async function(err, item){
             const newItem = new CartItem({
                                          userId : req.user.username,
                                          productId : requestedPostId,
                                          name: item.name,
                                          price: item.price,
                                          img : item.img, 
                                          email : item.email,
                                          availableAt : item.availableAt
                                          });
            await newItem.save();
            // window.alert("item added");
           });
        }
    });
  
  res.redirect("/services");
  }
  else{
    res.redirect("/login");
  }
});


// app.get("/checkOutCart", (req, res)=>{

//     CartItem.find({userId : req.user.username}, (err, data)=>{

//       if(err==null && data.length>0){
        
//         data.forEach(element => {
          
//           ServiceRequestItem.findOne({userId : element.userId, productId : element.productId}, (err,data)=>{
            
//             if(err==null && data==null ){

//               var serviceManEmail = '';
//               var serviceManAvailableAt = new Date().getTime();

//               AvailableItem.findOne({productId : element.productId}, (err, productData)=>{
//                 if(err==null && productData!=null){
                  
//                   serviceManEmail = productData.email;
//                   serviceManAvailableAt = productData.availableAt;
                  
//                   if(serviceManAvailableAt < new Date().getTime()){
//                     serviceManAvailableAt = new Date();
//                     AvailableItem.findOneAndUpdate({_id : productData.productId, }, {availableAt : new Date(new Date().getTime()+3600000)},(err,res)=>{
//                       if(err){
//                         console.log(err);
//                       }
//                     });
//                   }else{
    
//                   }
//                 }
//               });
              
//               var randomPassCode = Math.floor(Math.random()*9000)+1000;
              
//               const serviceRequest = new ServiceRequestItem({
//                 userId : element.userId,
//                 productId : element.productId,
//                 isCompleted : false,
//                 passcode : randomPassCode,
//                 timeAlloted : serviceManAvailableAt
//               });
//               serviceRequest.save();
//               // CartItem.findOneAndDelete({})
//               CartItem.findOneAndRemove({userId: element.userId, productId : element.productId}, function(err){console.log(err)});

//               var transporter = nodeMailer.createTransport({
//                 service : 'gmail',
//                 auth : {
//                   user : 'himanshu.singh18599@gmail.com',
//                   pass : ''
//                 }
//               });

//               var mailToUser = {
//                 from : 'himanshu.singh18599@gmail.com',
//                 to : "himanshu180599@gmail.com",
//                 subject : 'Service Booking Confirmation',

//                 // text : `Service Booked 
//                 //         Time : `+serviceManAvailableAt+`
//                 //         Passcode :`+randomPassCode
           

//                 text : `Service Booked 
//                         Time : `+serviceManAvailableAt.toLocaleString()+`
//                         Passcode :`+randomPassCode
//               }


//               var mailToServiceMan = {
//                 from : '',
//                 to : serviceManEmail,
//                 subject : 'New Service Booking',
//                 text : `Booking At : `+serviceManAvailableAt.toLocaleString() 
//               }

//               transporter.sendMail(mailToServiceMan, (err,info)=>{
//                 console.log("mail sent to serviceman");
//                 console.log(err);
//                 console.log(info);

//               });

//               transporter.sendMail(mailToUser, (err,info)=>{
//                   console.log("mail sent to user");
//                   console.log(err);
//                 console.log(info);
//               });

//               CartItem.findOneAndDelete({_id : element._id}, (err, info)=>{
//                 if(!err){
//                   console.log("One Cart Item Changed To Service Request");
//                 }
//               });

//             }
//           });
//         });
//       }
//     });

//   // CartItem.deleteMany({ userId : req.user.username}, function (err) {
//   //               if(err) 
//   //                 console.log(err);
//   //               else
//   //                 console.log("Successful deletion");
//   //              });
    

//     res.redirect("/front-page");

//   });





/////////////////////////----------------------//////////////////////
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started successfully");
});


///google credentials :- https://evening-headland-54486.herokuapp.com/auth/google/secrets

