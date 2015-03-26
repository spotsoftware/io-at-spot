//Services & Helpers
var actuatorService = require('./actuator');
var offlineHelper = require('./offline-helper');
var config = require('./config/config');

//NPM dependencies
var io = require('socket.io-client');
var client = require('request-json').newClient(config.SERVER_ADDR + ':' + config.SERVER_HTTP_PORT);

//Start of parallel entities
require('./config/close_handler');
require('./ble')(this);
require('./nfc')(this);
require('./hook');

//Module vars
var _socket = null;
var _isConnected = false;
var _readingUid = false;
var _readingUidTimeout = null;

function isOnline(){
    return _isConnected;
}

function authenticate(){
    //Secure socket configuration

    console.log('authenticating...');
    client.post('auth/device/', {
        id: config.ORGANIZATION_ID,
        password: config.ORGANIZATION_PASSWORD
    }, function(err, res, body) {
        if(err){
            console.log('cannot authenticate.');

            setTimeout(function(){
                authenticate();
            }, 10000);

        } else {
            connectSocket(body.token);
        }
    });
}

/*
* This function manages the socket connection:
* 1: try the connection
* 2: register socket events handler
*/
function connectSocket(authToken){

    //console.log('connecting to secure socket');

    _socket = io.connect(config.SERVER_ADDR + ':' + config.SERVER_SOCKET_PORT, {
        query: 'token=' + authToken
    });

    _socket.on('connect', function () {

        console.log('socket connected');

        _isConnected = true;

        //Cache mgmt
        offlineHelper.syncData(_socket);
    });

    _socket.on('disconnect', function () {
        // socket disconnected
        _isConnected = false;

        console.log('socket disconnected');
    });

    _socket.on('connect_timeout', function(){

        console.log('socket timed out');

        authenticate();
    });

    _socket.on('error', function () {
        console.log('socket error');
    });

    _socket.on('read', function(){
        _readingUid = true;
        actuatorService.startBlinking();

        readingUidTimeout = setTimeout(function(){
            _socket.emit('uid', {
                uid: null
            });

            actuatorService.stopBlinking();
            _readingUid = false;
        }, 5000);
    });

    _socket.on('members', function(data){
        offlineHelper.storeMembers(data.members);
    });

    _socket.on('workingDays', function(data){
        offlineHelper.storeWorkingDays(data.workingDays);
    });

}

function onNFCTagSubmitted(uid){
    if(_readingUid){
        _socket.emit('uid', {
            uid: uid
        });

        //Clear timeout and status variable
        actuatorService.stopBlinking();
        _readingUid = false;
        clearTimeout(_readingUidTimeout);
    } else {
        if(isOnline()){

            _socket.emit('nfcTagSubmitted', { uid: uid }, function(response){

                console.log(response);

                if(response.responseCode == 200){
                    actuatorService.openDoor();
                } else {
                    actuatorService.error();
                }
            });

        } else {

            if(offlineHelper.authorizeAccess(uid)){
                actuatorService.openDoor();
            } else {
                actuatorService.error();
            }
        }
    }
}

function onTokenSubmitted(stringData, callback){
    if(isOnline()){

        var token = stringData.substr(0, stringData.length - 1);
        var type = stringData.substr(stringData.length - 1);

        _socket.emit('tokenSubmitted', {
            token: token,
            workTimeEntryType: type === 'I' ? 'in' : 'out'
        }, function(response){

            console.log(response);

            if(response.responseCode == 200){
                actuatorService.openDoor();
            } else {
                actuatorService.error();
            }
            callback(response);
        });

    } else {
        actuatorService.error();

        callback({
            responseCode: 503,
            message: 'device is offline, cannot authenticate'
        });
    }
}


console.log('starting socket service');

authenticate();

exports.onNFCTagSubmitted = onNFCTagSubmitted;
exports.onTokenSubmitted = onTokenSubmitted;
