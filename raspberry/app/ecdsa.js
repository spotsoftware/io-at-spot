var config = require('./config/config');
var publicKey = config.NTAG212_PUBLIC_KEY;
var publicKeyName = config.NTAG212_PUBLIC_KEY_NAME;

function verifySignature(uid, signature, callback) {
    //mock
    var exec = require("child_process").exec;
    var cmd = './verify_sig.rb -k "' + publicKey + '" -s "' + signature + '" -d "' + uid + '"';
    exec(cmd, function (err, stdout, stderr) {
        if (stdout === 'true') {
            callback(true);
        } else {
            callback(false);
        }
    });
}

exports.verifySignature = verifySignature;