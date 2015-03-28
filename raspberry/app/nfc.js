var zerorpc = require("zerorpc"),
    pythonShell = require('python-shell'),
    ecdsa = require('./ecdsa'),
    logger = require('./logger');

var _listener = null;

var server = new zerorpc.Server({
    token: function (token, reply) {

        logger.debug('nfc token read: ' + token.toString());

        _listener.onTokenSubmitted(token, function (response) {

            reply(null, response);

        });
    },
    tag: function (uid, signature, reply) {

        logger.debug('nfc tag read, uid: ' + uid.toString() + ' signature: ' + signature.toString());

        var isValid = ecdsa.verifySignature(uid, signature);
        if (!isValid) {
            logger.debug('invalid uid signature');
            return reply(null, isValid);
        }

        //Valid UID
        _listener.onNFCTagSubmitted(uid);
        reply(null);
    }
});

server.bind("tcp://0.0.0.0:4242");

logger.debug('starting nfcpy');
///home/pi/Adafruit-WebIDE/repositories/pi-projects/node-server/python/nfc_controller.py
var python = require('child_process').spawn('python', ["python/nfc_controller.py"]);
process.on('exit', function () {
    python.kill();
});
module.exports = function (listener) {
    _listener = listener;
};