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

var pyshell = pythonShell.run("nfc_controller.py");
console.log('starting nfcpy');

module.exports = function(listener){
    _listener = listener;
};