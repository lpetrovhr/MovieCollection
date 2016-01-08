/**
 * Created by leon on 06.01.16..
 */

var mongoose = require('mongoose'),
    request = require('superagent'),
    expect = require('expect.js'),
    User = require('../app/models/user'),
    dbURL = 'mongodb://localhost/movieCollection',
    host = 'http://localhost:3000';

describe('Homepage', function(){
    it('should respond to GET', function(done){
        request
            .get(host)
            .end(function(err, res){
            expect(res).to.exists;
            expect(res.status).to.equal(200);
            done();
        });
    });
    it('should get ajax calls properly', function(done){
        request
            .get(host + '/userData?ajaxValue=566ebfd9f677998a40b1e4a8')
            .end(function(err, res){
                expect(res).to.exists;
                expect(res.status).to.equal(200);
                done();
            });
    });
    it('should go to signup page properly', function(done){
        request
            .get(host + '/signup')
            .end(function(err, res){
                expect(res).to.exists;
                expect(res.status).to.equal(200);
                done();
            });
    });

    it('should redirect to / if user is not auth', function(done){
        request.get(host + '/collection')
            .end(function(err, res){
                if(err) console.log(err);

                expect(res.status).to.equal(200);

                done();
            });
    });
});