const express = require ('express');
const bodyParser = require ('body-parser');
const nodemailer = require('nodemailer');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mongoose= require('mongoose');
const passport =require('passport');
const LocalStrategy = require('passport-local').Strategy;
const crypto=require('crypto');
const app= express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs');
app.use(express.static('public'));


mongoose.connect('mongodb://localhost/app');

const Schema = mongoose.Schema;
const user = new Schema({
    email: String,
    password: String
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

const User = mongoose.model('Users', user, 'Users');
module.exports= User;



app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
  
  }));



/*passport.use(new LocalStrategy(function(email, password, done) {
    User.findOne({ email: email }, function(err, user) {
      if (err) return done(err);
      if (!user) return done(null, false, { message: 'Incorrect username.' });
      user.comparePassword(password, function(err, isMatch) {
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Incorrect password.' });
        }
      });
    });
  }));
  
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });




const Schema= mongoose.Schema;
const userSchema= new Schema({
   // username: {type:String,required: true, unique: true },
    email:{type:String,required: true, unique: true },
    password: {type:String,required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date
});



  userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
      if (err) return cb(err);
      cb(null, isMatch);
    });
  };

  var User = mongoose.model('User', userSchema, 'user');

  mongoose.connect('mongodb://localhost/delivery');


  app.use(passport.initialize());
  app.use(passport.session());



app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) return next(err)
      if (!user) {
        return res.redirect('/login')
      }
      req.logIn(user, function(err) {
        if (err) return next(err);
        return res.redirect('/cart');
      });
    })(req, res, next);
  });


   /*app.use((req, res, next) => {
    console.log(req.session.user)
    if (req.session.user) {
      next();
    } else {
      res.status(401).send('Authorization failed! Please login');
    }
  });

  app.get('/cart',function(req,res){  res.render('cart', {
    title: 'Express',
    user: req.user});});

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
  });*/

  app.get('/', function(req,res){
    res.render('index');
});

app.get('/signup', function(req,res){
    res.render('signup');
});




app.get('/resturants/:name', function(req,res){
    var products=[{"name":'beans', "price":"500"},{"name":'rice', "price":"400"},{"name":'beans', "price":"500"}];
    res.render('menu',{products});
});
app.post('/signup',function(req, res) {
    var userdata= new User({
    email: req.body.email,
    password: req.body.password});
   /* User.create(userdata, function(err,user) {
       if(err){res.send('error')}
       else {
          res.redirect('/cart');
        }
      });*/
      
      userdata.save()
      .then((data)=> {
        console.log(data);
        res.send('Saved to database');
       })
      .catch((err)=> {
        console.log(err);
      })});


  app.get('/login', function(req, res) {
    res.render('login',{ alert:"none", msg:"0"})
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
           if (user.password != password){
        res.render('login',{ alert:"block", msg:"Incorrect Password"})
      } else{
     /// return done(null, user);
        req.session.user = user;
        req.session.user.expires = new Date(
            Date.now() + 3 * 24 * 3600 * 1000); // session expires in 3 days
            //console.log(req.session.user)
          res.redirect('/cart');}}
    });}});
 
  
app.listen(3000, ()=>{
    console.log('Listening on port 3000');
       });