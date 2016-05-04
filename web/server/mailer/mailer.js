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
    data.from = 'io@spot';
    if(!data.to) {
      data.to = config.google.mailNotificationTo;
    }
    transporter.sendMail(data, callback);
}

exports.sendMail = sendMail;