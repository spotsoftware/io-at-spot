var zerorpc = require("zerorpc"),
    pythonShell = require('python-shell'),
    ecdsa = require('./ecdsa');
    //,socketService = require('./socket');

var _listener = null;

var server = new zerorpc.Server({
    token: function(token, reply){
       
        console.log(token.toString());
        
        _listener.onTokenSubmitted(token, function(response){
            
            reply(null, response);
        
            
        });
    },
    tag: function(uid, signature, reply){           
        var isValid = ecdsa.verifySignature(uid, signature);
        if(!isValid){
            return reply(null, isValid);
        }
        
        //Valid UID
        _listener.onNFCTagSubmitted(uid);
        reply(null);
    }
});

server.bind("tcp://0.0.0.0:4242");

console.log('starting nfcpy');
var python = require('child_process').spawn('python', ["/home/pi/Adafruit-WebIDE/repositories/pi-projects/node-server/python/nfc_controller.py"]);
process.on('exit', function() {
    python.kill();
});
module.exports = function(listener){
    _listener = listener;
};