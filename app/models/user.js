var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var movieSchema = mongoose.Schema({
    title : String,
    director: String,
    duration: Number,
    storyline: String,
    year: Number,
    genre: String
});

var userSchema = mongoose.Schema({

    local  : {
        email : String,
        password : String,
        name : String
    },

    google : {
        id : String,
        token : String,
        email : String,
        name : String,
    },

    movie : [movieSchema]
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.local.password);
};

module.exports = mongoose.model('Movie', movieSchema);
module.exports = mongoose.model('User', userSchema);
