var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser =  require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var dbConfing = require('./config/database');

mongoose.connect('mongodb://localhost/movieCollection'); //connect do db

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
console.log('Server is running on port: ' + port);
