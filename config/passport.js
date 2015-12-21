/**
 * Created by leon on 29.11.15..
 */

var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var xss = require('xss');

var User = require('../app/models/user');

var configAuth = require('./auth');

module.exports = function(passport) {

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

    //Google oauth
    passport.use(new GoogleStrategy({

        clientID : configAuth.googleAuth.clientID,
        clientSecret: configAuth.googleAuth.clientSecret,
        callbackURL : configAuth.googleAuth.callbackURL,
        passReqToCallback : true
    },
        function (req, token, refreshToken, profile, done) {

            process.nextTick(function(){
                if(!req.user){
                User.findOne({'google.id' : profile.id}, function(err, user){
                    if(err)
                        return done(err);
                    if(user){

                        //relinking accs
                        if(!user.google.token){
                            user.google.token = token;
                            user.google.name = profile.displayName;
                            user.google.email = profile.emails[0].value;

                            user.save(function(err){
                                if(err)
                                    throw err;
                                return done(null, user);
                            });
                        }
                        //return user if found
                        return done(null, user);
                    } else{
                      //create new user
                        var newUser = new User();

                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value;
                    }

                    newUser.save(function(err){
                        if(err)
                            throw err;
                        return done(null, newUser);
                    });
                });
                } else{
                    var user = req.user;

                    user.google.id = profile.id;
                    user.google.token = token;
                    user.google.name = profile.displayName;
                    user.google.email = profile.emails[0].value;

                    user.save(function(err){
                        if(err)
                            throw err;
                        return done(null, user);
                    });
                }
            });
        }
    ));

    // Signup
    passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true //pass entire req to callback
    },
    function(req, email, password, done){
     process.nextTick(function(){
         User.findOne({'local.email' : email}, function(err, user){
             if(err) {
                 console.log('error');
                 return done(err); //return error if there is any
             }
             if(user){
                 console.log('user exists');
                 return done(null, false, req.flash('signupMessage','User already exists'));
             } else {
                 var newUser = new User();
                 console.log(xss(email));
                 console.log(xss(password));
                 newUser.local.email = xss(email);
                 newUser.local.password = newUser.generateHash(password);
                 newUser.local.name = xss(req.body.uName);
                 newUser.save(function(err){
                     if(err)
                        throw err;
                     return done(null, newUser);
                 });
             }
         })
     });
    }
    ));

    //Login
    passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
    },
    function(req, email, password, done){

        User.findOne({'local.email' : email}, function(err, user){
            if(err) {
                return done(err);
            }
            if(!user) {
                return done(null, false, req.flash('loginMessage', 'There is no such user!'));
            }
            if(!user.validPassword(password)) {
                console.log('incorrect pass');
                return done(null, false,  req.flash('loginMessage', 'Incorrect username or password!'));
            }

            return done(null, user, {message: 'Login successful'});
        });
    }));
};