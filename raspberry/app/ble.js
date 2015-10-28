var util = require('util');
var bleno = require('bleno');
var logger = require('./logger');

var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;

var uids = {
    Service: 'f000cc40-0451-4000-b000-000000000000',
    DigitalSignatureCharacteristic: 'f000cc41-0451-4000-b000-000000000000',
    WriteTokenChunkCharacteristic: 'f000cc42-0451-4000-b000-000000000000',
    NotifyCharacteristic: 'f000cc43-0451-4000-b000-000000000000',
    WriteLastTokenChunkCharacteristic: 'f000cc44-0451-4000-b000-000000000000',
    WriteAccessTypeCharacteristic: 'f000cc45-0451-4000-b000-000000000000',
    WriteTokenHashCharacteristic: 'f000cc46-0451-4000-b000-000000000000'
}

var _listener = null,
    notifyCallback = null,
    dataBuffer = null,
    accessType = 0; //0 --> Open & mark, 1 --> Open only, 2 --> Mark only

var DigitalSignatureCharacteristic = function () {
    DigitalSignatureCharacteristic.super_.call(this, {
        uuid: uids.DigitalSignatureCharacteristic,
        properties: ['read']
    });
};

util.inherits(DigitalSignatureCharacteristic, BlenoCharacteristic);

DigitalSignatureCharacteristic.prototype.onReadRequest = function (offset, callback) {

    logger.debug('BLE digital signature characteristic read request.');

    var result = this.RESULT_SUCCESS;
    var data = new Buffer('dynamic value');

    if (offset > data.length) {
        logger.error('invalid BLE read');
        result = this.RESULT_INVALID_OFFSET;
        data = null;
    }

    callback(result, data);
};

var WriteTokenChunkCharacteristic = function () {

    WriteTokenChunkCharacteristic.super_.call(this, {
        uuid: uids.WriteTokenChunkCharacteristic,
        properties: ['write'],
        //secure: ['write']
    });
};

util.inherits(WriteTokenChunkCharacteristic, BlenoCharacteristic);

WriteTokenChunkCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
    
    if (dataBuffer === null) {
        dataBuffer = data;
    } else {
        var newBuffer = Buffer.concat([dataBuffer, data]);
        dataBuffer = newBuffer;
    }
    callback(this.RESULT_SUCCESS);
};

var WriteAccessTypeCharacteristic = function () {

    WriteAccessTypeCharacteristic.super_.call(this, {
        uuid: uids.WriteAccessTypeCharacteristic,
        properties: ['write'],
        //secure: ['write']
    });
};

util.inherits(WriteAccessTypeCharacteristic, BlenoCharacteristic);

WriteAccessTypeCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {

    accessType = data.readUInt32LE(0); 

    callback(this.RESULT_SUCCESS);
};

var WriteLastTokenChunkCharacteristic = function () {
    WriteLastTokenChunkCharacteristic.super_.call(this, {
        uuid: uids.WriteLastTokenChunkCharacteristic,
        properties: ['write'],
        //secure: ['write']
    });
};

util.inherits(WriteLastTokenChunkCharacteristic, BlenoCharacteristic);

WriteLastTokenChunkCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
    
    
    var newBuffer = Buffer.concat([dataBuffer, data]);
    dataBuffer = newBuffer;

    logger.debug('BLE final token read:' + dataBuffer.toString());

    _listener.onTokenSubmitted(dataBuffer.toString(), accessType, function (response) {

        //write back the response and disconnect client!
        var data = new Buffer(4);
        data.writeUInt32LE(response.responseCode, 0);
        logger.debug('notify back client');
        notifyCallback(data);

    });

    callback(this.RESULT_SUCCESS);
};

var NotifyCharacteristic = function () {
    NotifyCharacteristic.super_.call(this, {
        uuid: uids.NotifyCharacteristic,
        properties: ['notify'],
        //secure: ['write']
    });
};

util.inherits(NotifyCharacteristic, BlenoCharacteristic);

NotifyCharacteristic.prototype.onSubscribe = function (maxValueSize, updateValueCallback) {
    logger.debug('client subscribed to notify characteristic');

    notifyCallback = updateValueCallback;
};

NotifyCharacteristic.prototype.onUnsubscribe = function () {
    logger.debug('client unsubscribed from notify characteristic');

    setTimeout(function () {
        logger.debug('forcing client disconnection');
        bleno.disconnect();
    }, 500);
};

NotifyCharacteristic.prototype.onNotify = function () {
    logger.debug('on notify');
};

var WriteTokenHashCharacteristic = function () {

    WriteTokenHashCharacteristic.super_.call(this, {
        uuid: uids.WriteTokenHashCharacteristic,
        properties: ['write'],
        //secure: ['write']
    });
};

util.inherits(WriteTokenHashCharacteristic, BlenoCharacteristic);

WriteTokenHashCharacteristic.prototype.onWriteRequest = function (data, offset, withoutResponse, callback) {
    
    _listener.onTokenHashSubmitted(data.toString('hex'), accessType, function (response) {

        //write back the response and disconnect client!
        var data = new Buffer(4);
        data.writeUInt32LE(response.responseCode, 0);
        logger.debug('notify back client');
        notifyCallback(data);

    });
    
    callback(this.RESULT_SUCCESS);
};

function SampleService() {
    SampleService.super_.call(this, {
        uuid: uids.Service,
        characteristics: [
          new DigitalSignatureCharacteristic(),
          new WriteTokenChunkCharacteristic(),
          new NotifyCharacteristic(),
          new WriteLastTokenChunkCharacteristic(),
          new WriteAccessTypeCharacteristic(),
          new WriteTokenHashCharacteristic()
        ]
    });
}

util.inherits(SampleService, BlenoPrimaryService);

bleno.on('stateChange', function (state) {
    logger.debug('bleno state change: ' + state);

    if (state === 'poweredOn') {
        bleno.startAdvertising('raspy', [uids.Service]);
    } else {
        bleno.stopAdvertising();
    }
});

// Linux only events /////////////////
bleno.on('accept', function (clientAddress) {
    logger.debug('bleno accept client: ' + clientAddress);


    dataBuffer = null;
    accessType = 0;
});

bleno.on('disconnect', function (clientAddress) {
    logger.debug('bleno disconnect client: ' + clientAddress);
});

bleno.on('rssiUpdate', function (rssi) {
    logger.debug('bleno rssi update: ' + rssi);
});
//////////////////////////////////////

bleno.on('advertisingStart', function (error) {

    if (error) {
        logger.fatal(error, 'bleno: cannot start advertising');
    }
    logger.debug('bleno advertising start.');

    if (!error) {
        bleno.setServices([
          new SampleService()
        ]);
    }
});

bleno.on('advertisingStop', function () {
    logger.debug('bleno advertising stop.');
});

bleno.on('servicesSet', function () {
    logger.debug('bleno service set.');
});

module.exports = function (listener) {
    _listener = listener;
};
