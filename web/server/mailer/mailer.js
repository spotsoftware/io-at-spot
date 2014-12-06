var config = require('../config/environment');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.google.user,
        pass: config.google.password
    }
});


function sendMail(data, callback) {
    data.from = config.google.user;
    transporter.sendMail(data, callback);
}

exports.sendMail = sendMail;