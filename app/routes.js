var mongooes = require('mongoose');
var xss = require('xss');
var Movie = mongooes.model('Movie');
var User = mongooes.model('User');

module.exports = function(app, passport){

    app.get('/', function(req,res){
        User.find({}, function(err, users){
            var userMap = [];

            users.forEach(function(user){
                userMap.push(user);
            });
            res.render('index.ejs', {message: req.flash('loginMessage'), users: userMap});
        });
    });

    app.get('/userData', function (req, res) {
        console.log('req: ' + req.param('ajaxValue'));
        var userID = req.param('ajaxValue');

        User.findOne({'_id' : userID}, function(err, user){
            var mapThisShit = [];
            var movie = user.movie
            console.log(user.movie);
            movie.forEach(function(mov){
                var uM = JSON.stringify(mov);
                var uMP = JSON.parse(uM);
                mapThisShit.push(uMP);
            });
            console.log('Parsed JSON data: '+ mapThisShit);
            if(mapThisShit.length == 0){
                console.log('Map is empty I will return message with ajax success');

                res.send({emptyMsg: 'This user has no movies in his collection'});
            }
            else {
                res.send({movies: mapThisShit});
            }
            //console.info(user);
        });
    });

    app.route('/collection')
        .get(isLoggedIn, function(req, res){
            var user = req.user;
            res.render('collection.ejs', {user: user});
        });

    app.route('/addMovie')
        .post(function(req, res){
            var user = req.user;
            new Movie({
                title: xss(req.body.mTitle),
                director: xss(req.body.mDirector),
                duration: req.body.mDuration,
                storyline: xss(req.body.mStory),
                year: req.body.mYear,
                genre: xss(req.body.mGenre)
            }).save(function(err, mov){
                if(err) throw err;

                user.movie.push(mov);
                user.save(function(err){
                    if(err) throw err;
                    res.redirect('/collection');
                });
            });
        });

    app.route('/login')
        .get(function(req,res){
            res.render('login.ejs', {message: req.flash('loginMessage')});
        })
        .post(passport.authenticate('local-login', {
            successRedirect : '/collection',
            failureRedirect : '/',
            failureFlash : true,
            successFlash : true
        }));

    app.route('/signup')
        .get(function(req, res){
            res.render('signup.ejs', {message: req.flash('signupMessage')});
        })
        .post(passport.authenticate('local-signup', {
            successRedirect : '/collection',
            failureRedirect : '/signup',
            failureFlash : true,
            successFlash: true
        }));

    app.get('/profile', isLoggedIn, function(req,res){

        res.render('profile.ejs', {
            user: req.user
        });
    });

    app.get('/logout', function(req,res){
        req.logout();
        res.redirect('/');
    });

    //get profile information and email from google
    app.get('/auth/google', passport.authenticate('google', {scope : ['profile', 'email']}));

    //redirection after authentication
    app.get('/auth/google/callback', passport.authenticate('google', {
        successRedirect : '/collection',
        failureRedirect : '/'
    }));

    app.route('/connect/local')
     .get(function(req, res){
        res.render('connect-local.ejs', {message : req.flash('loginMessage')});
    });
        app.post('/connect/local', passport.authenticate('local-signup', {
            successRedirect : '/collection',
            failureRedirect : '/connect/local',
            failureFlash : true
        }));
    app.get('/connect/google', passport.authorize('google', {scope : ['profile', 'email']}));

    app.get('/connect/google/callback', passport.authorize('google', {
        successRedirect : '/collection',
        failureRedirect : '/'
    }));

    /*app.get('/unlink/local', function(req, res){
        var user = req.user;
        user.local.email = undefined;
        user.local.password = undefined;
            user.save(function(err){
                if(err) throw err;
            res.redirect('/profile');
        });
    });*/

    app.get('/unlink/google', function(req, res){
        var user = req.user;
        user.google.token = undefined;
        user.save(function(err){
            if(err) throw err;
            res.redirect('/profile');
        });
    });
};

function isLoggedIn(req, res, next){
    if(req.isAuthenticated())
        return next();

    res.redirect('/');
}