const express = require ('express');
const bodyParser = require ('body-parser');
const nodemailer = require('nodemailer');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose= require('mongoose');
const crypto=require('crypto');
var async = require('async');
const dotenv=require('dotenv').config({silent:true});

const app= express();
const port=process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs');
app.use(express.static('public'));


var url=process.env.MONGO_URI;
mongoose.connect("mongodb://localhost:27017/app");

const Schema = mongoose.Schema;
const user = new Schema({
    email: String,
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
    });



    user.pre('save', function(next) {
        var user = this;
        var SALT_FACTOR = 12;
      
     //  if (!user.isModified('password')) return next();
      
        bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
          if (err) return next(err);
      
          bcrypt.hash(user.password, salt,  function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            console.log(user.password);
            next();
          });
        });
      });

      user.methods.comparePassword = function(candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
          if (err) return cb(err);
          cb(null, isMatch);
        });
      };
    
const User = mongoose.model('Users', user, 'Users');
module.exports= User;


const product = new Schema({
    name: String,
    price:Number,
    code:String
    });
    const Product = mongoose.model('products', product, 'products');

    const resturant = new Schema({
        name: String,
             
        });
        const Resturant = mongoose.model('resturants',resturant, 'resturants');

        var Order= new Schema({
         address: String,
         phone: Number,
         createdAt:Date,
         tray:String
          
          });
          var Order = mongoose.model('orders',Order, 'orders');


app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
  
  }));




app.get('/admin/dashboard', function(req,res){
  res.render('admin-dashboard',{user:req.session.user});
if(user){console.log(user.email)}
});




app.get('/admin/resturants', function(req,res){
  Resturant.find({},function(err, data) {
      if (err){ res.send('error')} 
      else{
        var resturants =data.sort(function(a,b){
          var txtA= a.name.toUpperCase();
          var txtB= b.name.toUpperCase();
          return (txtA<txtB)?-1: (txtA>txtB)?1:0;
         });
  res.render('admin-resturants',{resturants:resturants,user:req.session.user});}

});});
 
 
app.post('/admin-add',function(req,res){
  var name=req.body.name;
  Resturant.findOne({
  name: name
   }, function(err,resturant) {
     if (err) 
     { res.send("An error occured"); } 

     if (resturant) {
      res.send("User exists");   }
        if(!resturant){  
            var rest= new Resturant({
              name:req.body.name
               });
  rest.save() 
  .then((data)=> {
     res.redirect('/admin/resturants');
})
.catch((err)=> {
res.send("An error occured");
})
}})     })


app.get('/admin/resturants/:name', function(req,res){
  var code= req.params.name;
Product.find({
  code: code
 }, function(err, data) {
  if (err){ res.send('error')} 
  else{
var products=data}

 res.render('admin-menu',{products, code:code,user:req.session.user,status:"success", msg:" ",alert:"none"});
});});

app.post("/admin/remove/products", function(req,res){
  var name=req.body.name;
  Products.deleteOne({name:name}, function(err,data){if (err){res.send('error')}
      
     res.render('admin-menu',{products, code:code,user:req.session.user,status:"success", msg:" ",alert:"none"});
    });})




  app.get('/', function(req,res){
    res.render('index',{user:req.session.user});
  if(user){console.log(user.email)}
});

app.get('/signup', function(req,res){
    res.render('signup',{ alert:"none", msg:"0"});
});

app.post('/signup',function(req, res) {
    
   var email= req.body.email,
    password= req.body.password;
        User.findOne({
        email: email
       }, function(err, user) {
         if (err) 
         { res.render('signup',{ alert:"block", msg:"An error occured. Please try again"});   } 
    
         if (user) {
           res.render('signup',{ alert:"block", msg:"User already exists"})    }
            if(!user){  
                var userdata= new User({
                    email: req.body.email,
                    password: req.body.password});
      userdata.save()
      .then((data)=> {
            
        req.session.user = data;
        req.session.user.expires = new Date(
            Date.now() + 3 * 24 * 3600 * 1000); // session expires in 3 days
            res.redirect('/');
       })
      .catch((err)=> {
        res.render('signup',{ alert:"block", msg:"An error occured. Please try again"});
      })}});});


  app.get('/login', function(req, res) {
    res.render('login',{ alert:"none", msg:""})
  });

  app.post('/login', 
  function(req, res) {
    var email= req.body.email;
    var password= req.body.password;
    if (!req.body.email ||!req.body.password) {
      res.render('login',{ alert:"block", msg:"Please fill all required fields"})}
 
      else{ 
    User.findOne({
     email: email
    }, function(err, user) {
      if (err) 
      { res.render('login',{ alert:"block", msg:"An error occured. Please try again"});   } 
 
      if (!user) {
        res.render('login',{ alert:"block", msg:"User not found"})    }
         if(user){  
        user.comparePassword(password, function(err, isMatch) {
            if (isMatch) {
               
        req.session.user = user;
        req.session.user.expires = new Date(
            Date.now() + 3 * 24 * 3600 * 1000); // session expires in 3 days
            console.log(req.session.user);
            res.redirect('/')
         } else {
        res.render('login',{ alert:"block", msg:"Incorrect Password"})}
 
     
   });}});}});
 
   app.get('/logout',function(req,res){
    if(req.session){
        //delete session object
        req.session.destroy(function(err){
            if(err){return next(err);}
            else{
                return res.redirect('/')
            }
        })
    }
});
  
app.get('/forgot', function(req,res){
    res.render('forgot');
});
app.post('/forgot', function(req, res, next) {
    async.waterfall([
      function(done) {
        crypto.randomBytes(20, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({ email: req.body.email }, function(err, user) {
          if (!user) {
           console.log('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var smtpTransport = nodemailer.createTransport( {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
          auth: {
            user: '',
            pass: ''
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err,info) {
            if(err){console.log(err)}
            else{
          console.log('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');}
         
        });
      }
    ],
);
  });

  app.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        console.log('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {
        user: req.user
      });
    });
  });

  app.post('/reset/:token', function(req, res) {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
           console.log('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
  
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
  
          user.save(function(err) {
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
      },
     function(token, user, done) {
        var smtpTransport = nodemailer.createTransport( {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
          auth: {
            user: '',
            pass: ''
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'passwordreset@demo.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
         console.log( 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], function(err) { 
      res.redirect('/login');
    });
  });

  app.use((req, res, next) => {
    console.log(req.session.user)
    if (req.session.user) {
      next();
    } else {
     res.redirect("/login")
    }
  });

  app.get('/resturants', function(req,res){
    Resturant.find({},function(err, data) {
        if (err){ res.send('error')} 
        else{
           var resturants =data.sort(function(a,b){
               var txtA= a.name.toUpperCase();
               var txtB= b.name.toUpperCase();
               return (txtA<txtB)?-1: (txtA>txtB)?1:0;
           });
    res.render('resturants',{resturants:resturants,user:req.session.user});}
  
});});






app.get('/resturants/:name', function(req,res){
    var code= req.params.name;
 Product.find({
    code: code
   }, function(err, data) {
    if (err){ res.send('error')} 
    else{
  var products=data}
 
   res.render('menu',{products, code:code,user:req.session.user,status:"success", msg:" ",alert:"none"});
});});



  app.get('/cart', function(req,res){
    res.render('cart',{status:"success", msg:" ",alert:"none",user:req.session.user})
  });

 

    
  
  app.post('/order', function(req,res){
  
    var neworder= new Order({
      address: req.body.address,
      phone: req.body.phone,
      createdAt:Date.now(),
      // tray:req.body.tray
    });
   if(req.body.address==""|| req.body.phone==""){res.render('done',{status:"danger", user:req.session.user, msg:"Please fill in all fields",alert:"block",user:req.session.user})}
  neworder.save().then((data)=> {
  //res.redirect('/');
  res.render('done',{status:"success",  user:req.session.user,msg:"Congratulations!! Your order has been successfully placed",alert:"block",user:req.session.user})
  })
  .catch((err)=> {
    res.render('done',{status:"danger", user:req.session.user, msg:"Your Order was not successful",alert:"block",user:req.session.user})
  })
  });
app.listen(port, ()=>{
   
       });