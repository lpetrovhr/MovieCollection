var express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),
    morgan = require('morgan'),
    cookieParser =  require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session');

/*
mongoose.connect('mongodb://localhost/movieCollection'); //connect do db local
*/

//MONGOLAB_URI= "mongodb://example:example@ds037005.mongolab.com:37005/moviecollection"

mongoose.connect("mongodb://example:example@ds037005.mongolab.com:37005/moviecollection", function(err){
    if(err) console.log(err);
    else console.log('mongodb connected');
});

require('./config/passport')(passport);//pass passport to config/passport.js

app.use(morgan('dev')); //logs every req to console
app.use(cookieParser()); //read cookies
app.use(bodyParser.json()),
    app.use(bodyParser.urlencoded({extended: true})); //get information from html forms
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs'); //set up(use) ejs for templating
app.use(session({secret: 'mojamalatajna', resave: true,
    saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./app/routes')(app, passport); // loads routes in app and passport

app.listen(port);

console.log('Server running on port ' + port);