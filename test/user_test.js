var mongoose = require('mongoose'),
    request = require('superagent'),
    expect = require('expect.js'),
    User = require('../app/models/user'),
    dbURL = 'mongodb://localhost/movieCollection',
    host = 'http://localhost:3000';

describe('User', function(){

    var userLog = null;

    var cookie = null;

    before(function(done){
        db = mongoose.connect(dbURL);
        done();
    });
    after(function(done){
        mongoose.connection.close();
        done();
    });

    beforeEach(function(done){
        var user = new User();
        user.local.email = 'test@test.com';
        user.local.password = user.generateHash('test');
        user.local.name = 'Test User';
        user.save(function(err){
            if(err) console.log('Error: ' + err.message);
            else console.log('User created successful');

            done();
        });

        userLog = user;
    });

    it('Login', function(done){
        request.post(host + '/login')
            .send({email: 'test@test.com', password: 'test'})
            .end(function(err, res){
                if(err) console.log('Error on login');

                cookie = res.headers['set-cookie'];
                expect(res.status).to.equal(200);

                done();
            });
    });

    it('Logout', function(done){
        request.get(host + '/logout')
            .end(function(err, res){
                if(err) console.log('Error on logout');

                request.get(host + '/')
                    .end(function(err, res){
                        if(err) console.log(err);

                        expect(res.status).to.equal(200);

                        done();
                    });
            });
    });


    afterEach(function(done){
        User.remove({'local.email' : 'test@test.com'}, function(err){
            if(err) console.log('Error removing user: ' + err);

            console.log('User removed');

            done();
        });
    });
});