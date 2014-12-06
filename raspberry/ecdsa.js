//var crypto = require('crypto');
//var ecparams = require('ecurve-names')('secp128r1');
var ecdsa = require('ecdsa')('secp128r1');
var config = require('./config/config');
var publicKey = config.NTAG212_PUBLIC_KEY;
var publicKeyName = config.NTAG212_PUBLIC_KEY_NAME;

function verifySignature(uid, signature){
    //mock
    return true;
    
    var signatureBuf = new Buffer(signature, 'hex');
    var uidBuf = new Buffer(uid, 'hex');
    var publicKeyBuf = new Buffer(publicKey, 'hex');
    
    console.log("uid: ", uid, uidBuf);
    console.log("sign: ", signature, signatureBuf);
    console.log("publicKey: ", publicKey, publicKeyBuf);
    
    //console.log(ecdsa);
    //console.log(signature);
    var isValid;
    try {
        isValid = ecdsa.verify(uidBuf, signatureBuf, publicKeyBuf);
    }
    catch(ex){
        console.log(ex);
    }
    
    
    console.log('isvalid?', isValid);
    return isValid;
}

exports.verifySignature = verifySignature;
