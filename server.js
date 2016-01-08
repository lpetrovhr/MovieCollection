var express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    passport = require('passport'),
    flash = require('connect-flash'),
    morgan = require('morgan'),
    cookieParser =  require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    argv = require('minimist')(process.argv.slice(2));

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

var domain = 'localhost';
if(argv.domain != undefined) {
    domain = argv.domain;
} else {
    console.log('No --domain=xxx specified, taking default hostname "localhost".');
}
var port = 3000;
if(argv.port !== undefined) {
    port = argv.port;
} else {
    console.log('No --port=xxx specified, taking default port ' + port + '.')
}

var applicationUrl = 'http://' + domain + ':' + port;
console.log('Movie Collection API running on ' + applicationUrl);

require('./app/routes')(app, passport); // loads routes in app and passport

app.listen(port);
