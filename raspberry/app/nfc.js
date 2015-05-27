var zerorpc = require("zerorpc"),
    pythonShell = require('python-shell'),
    ecdsa = require('./ecdsa'),
    logger = require('./logger');

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

        ecdsa.verifySignature(uid, signature, function(isValid){
            
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

server.bind("tcp://0.0.0.0:4242");

logger.debug('starting nfcpy');
///home/pi/Adafruit-WebIDE/repositories/pi-projects/node-server/python/nfc_controller.py
var python = require('child_process').spawn('python', ["python/nfc_controller.py", "usb"]);
//var python = require('child_process').spawn('python', ['python/nfc_controller.py', 'tty:AMA0:pn53x']);
process.on('exit', function () {
    python.kill();
});
python.stdout.pipe(process.stdout);
python.stderr.pipe(process.stderr);
module.exports = function (listener) {
    _listener = listener;
};