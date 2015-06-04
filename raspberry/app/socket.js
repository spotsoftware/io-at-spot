//Services & Helpers
var actuatorService = require('./actuator');
var offlineHelper = require('./offline-helper');
var config = require('./config/config');
var log = require('./logger');

//NPM dependencies
var io = require('socket.io-client');
var client = require('request-json').newClient(config.SERVER_ADDR + ':' + config.SERVER_HTTP_PORT);

//Start of parallel entities
require('./config/close_handler');
require('./ble')(this);
require('./nfc')(this);

//Module vars
var _socket = null;
var _isConnected = false;
var _readingUid = false;
var _readingUidTimeout = null;

function isOnline() {
    return _isConnected;
}

function authenticate() {
    //Secure socket configuration

    log.debug('authenticating...');

    client.post('auth/device/', {
        id: config.ORGANIZATION_ID,
        password: config.ORGANIZATION_PASSWORD
    }, function (err, res, body) {
        if (err) {
            log.error(err, 'cannot authenticate.');

            setTimeout(function () {
                authenticate();
            }, 60000);

        } else {
            log.info('authenticated. Connecting to secure socket with token :' + body.token);
            connectSocket(body.token);
        }
    });
}

/*
 * This function manages the socket connection:
 * 1: try the connection
 * 2: register socket events handler
 */
function connectSocket(authToken) {

    _socket = io.connect(config.SERVER_ADDR + ':' + config.SERVER_SOCKET_PORT, {
        query: 'token=' + authToken
    });

    _socket.on('connect', function () {

        log.debug('socket connected');

        _isConnected = true;

        //Cache mgmt
        offlineHelper.syncData(_socket);
    });

    _socket.on('disconnect', function () {
        // socket disconnected
        _isConnected = false;

        log.warn('socket disconnected');
    });

    _socket.on('connect_timeout', function () {

        log.warn('socket timed out');

        authenticate();
    });

    _socket.on('error', function (err) {
        log.error(err, 'socket error');
    });

    _socket.on('read', function () {
        log.info('reading nfc uid request, start blinking');

        _readingUid = true;
        actuatorService.startBlinking();

        readingUidTimeout = setTimeout(function () {
            log.info('was not possible to read uid in last 5 seconds');

            _socket.emit('uid', {
                uid: null
            });

            actuatorService.stopBlinking();
            _readingUid = false;
        }, 5000);
    });

    _socket.on('members', function (data) {
        offlineHelper.storeMembers(data.members);
    });

    _socket.on('workingDays', function (data) {
        offlineHelper.storeWorkingDays(data.workingDays);
    });

}

function onNFCTagSubmitted(uid) {
    log.info('nfc tag read, uid:' + uid);

    if (_readingUid) {
        _socket.emit('uid', {
            uid: uid
        });

        //Clear timeout and status variable
        actuatorService.stopBlinking();
        _readingUid = false;
        clearTimeout(_readingUidTimeout);
    } else {
        if (isOnline()) {

            _socket.emit('nfcTagSubmitted', {
                uid: uid
            }, function (response) {

                log.info({
                    response: response
                }, 'nfc authentication response received');

                if (response.responseCode == 200) {
                    //Need more specified details on authentication
                    actuatorService.openDoor();
                } else {
                    //Need more specified details on authentication error
                    actuatorService.error();
                }
            });

        } else {
            if (offlineHelper.authorizeAccess(uid)) {
                actuatorService.openDoor();
            } else {
                actuatorService.error();
            }
        }
    }
}

function onTokenSubmitted(stringData, mark, callback) {
    log.info('token read:' + stringData);

    if (isOnline()) {

        var token = stringData;

        _socket.emit('tokenSubmitted', {
            token: token,
            mark: mark
        }, function (response) {

            log.info({
                response: response
            }, 'token authentication response received');

            if (response.responseCode == 200) {
                actuatorService.openDoor();
            } else {
                actuatorService.error();
            }
            callback(response);
        });

    } else {
        log.warn('device is offline, cannot authenticate.');

        actuatorService.error();

        callback({
            responseCode: 503,
            message: 'device is offline, cannot authenticate'
        });
    }
}


log.debug('starting socket service');

authenticate();

exports.onNFCTagSubmitted = onNFCTagSubmitted;
exports.onTokenSubmitted = onTokenSubmitted;