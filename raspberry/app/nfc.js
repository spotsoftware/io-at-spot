var zerorpc = require("zerorpc"),
    pythonShell = require('python-shell'),
    ecdsa = require('./ecdsa'),
    logger = require('./logger');

var nfc = require('./lib/nfc');

var _listener = null;

var server = new zerorpc.Server({
    token: function (token, mark, reply) {

        mark = (mark === 'true');
        logger.debug('nfc token read: ' + token.toString() + ', mark = ' + mark);

        _listener.onTokenSubmitted(token, mark, function (response) {

            reply(null, response);

        });
    },
    tag: function (uid, signature, reply) {

        logger.debug('nfc tag read, uid: ' + uid.toString() + ' signature: ' + signature.toString());

        ecdsa.verifySignature(uid, signature, function (isValid) {

            if (!isValid) {
                logger.debug('invalid uid signature');
                return reply(null, isValid);
            }

            //Valid UID
            _listener.onNFCTagSubmitted(uid);
            reply(null);

        });

    }
});

nfc.open(function (err, dev) {
    setTimeout(function () {
        server.bind("tcp://0.0.0.0:4242");

        logger.debug('starting nfcpy');
        ///home/pi/Adafruit-WebIDE/repositories/pi-projects/node-server/python/nfc_controller.py
        var extNfc = require('child_process').spawn('python', ["python/acr122/nfc_controller.py", "usb"]);
        var intNfc = require('child_process').spawn('python', ['python/ada_pn532/nfc_controller.py']);
        
        process.on('exit', function () {
            extNfc.kill();
            intNfc.kill();
        });
        intNfc.stdout.on('data', function (data) {
            logger.debug('internal reader: ' + data);
        });
        intNfc.stderr.on('data', function (data) {
            logger.error('internal reader: ' + data);
        });
        extNfc.stdout.on('data', function (data) {
            logger.debug('external reader: ' + data);
        });
        extNfc.stderr.on('data', function (data) {
            logger.error('external reader: ' + data);
        });

    }, 1000);
});


module.exports = function (listener) {
    _listener = listener;
};