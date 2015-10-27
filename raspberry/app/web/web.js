var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),    
    passport = require('passport');

var app = express(),
    _listener;

app.use(bodyParser.urlencoded({
    extended: true
}));                        //middleware to parse url
app.use(bodyParser.json()); //middleware to parse json
app.use(cookieParser());    //middleware to read cookies (needed for auth)
app.use(session({
    secret: 'supersecret', 
    saveUninitialized: true,
    resave: true
})); //set session parameters

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

//Passport
require('./passport')(passport);


var server = app.listen(80, function () {
});

module.exports = function (listener) {
    //Routing
    require('./routes.js')(app, passport, listener);
};