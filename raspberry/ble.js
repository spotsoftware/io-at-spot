var util = require('util');
var bleno = require('bleno');
var BlenoPrimaryService = bleno.PrimaryService;
var BlenoCharacteristic = bleno.Characteristic;

var _listener = null,
    notifyCallback = null,
    dataBuffer = null;


var DigitalSignatureCharacteristic = function() {
  DigitalSignatureCharacteristic.super_.call(this, {
    uuid: 'f000cc41-0451-4000-b000-000000000000',
    properties: ['read']
  });
};

util.inherits(DigitalSignatureCharacteristic, BlenoCharacteristic);

DigitalSignatureCharacteristic.prototype.onReadRequest = function(offset, callback) {
    
    //console.log('Read request :)');
    var result = this.RESULT_SUCCESS;
    var data = new Buffer('dynamic value');

    if (offset > data.length) {
        result = this.RESULT_INVALID_OFFSET;
        data = null;
    }

    callback(result, data);
};

var WriteTokenChunkCharacteristic = function(){
    
    WriteTokenChunkCharacteristic.super_.call(this, {
    uuid: 'f000cc42-0451-4000-b000-000000000000',
    properties: ['write'],
    secure: ['write']
  });
};

util.inherits(WriteTokenChunkCharacteristic, BlenoCharacteristic);

WriteTokenChunkCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {

    if(dataBuffer === null) {
        dataBuffer = data;
    }else {
        var newBuffer = Buffer.concat([dataBuffer, data]);
        dataBuffer = newBuffer;
    }
    callback(this.RESULT_SUCCESS);
};

var WriteLastTokenChunkCharacteristic = function() {
  WriteLastTokenChunkCharacteristic.super_.call(this, {
    uuid: 'f000cc44-0451-4000-b000-000000000000',
    properties: ['write'],
    secure: ['write']
  });
};

util.inherits(WriteLastTokenChunkCharacteristic, BlenoCharacteristic);

WriteLastTokenChunkCharacteristic.prototype.onWriteRequest = function(data, offset, withoutResponse, callback) {

    var newBuffer = Buffer.concat([dataBuffer, data]);
    dataBuffer = newBuffer;
    console.log('last', dataBuffer.toString());
    _listener.onTokenSubmitted(dataBuffer.toString(), function(response){
        
        //write back the response and disconnect client!
        var data = new Buffer(4);
        data.writeUInt32LE(response.responseCode, 0);  
        console.log('notification!');
        notifyCallback(data);
        
        setTimeout(function(){    
            bleno.disconnect();
        }, 500)
       
    });
    
    callback(this.RESULT_SUCCESS);
};

var NotifyCharacteristic = function() {
  NotifyCharacteristic.super_.call(this, {
    uuid: 'f000cc43-0451-4000-b000-000000000000',
    properties: ['notify'],
    secure: ['write']
  });
};

util.inherits(NotifyCharacteristic, BlenoCharacteristic);

NotifyCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
  console.log('NotifyCharacteristic subscribe');
  
  notifyCallback = updateValueCallback;

};

NotifyCharacteristic.prototype.onUnsubscribe = function() {
  console.log('NotifyCharacteristic unsubscribe');

  if (this.changeInterval) {
    clearInterval(this.changeInterval);
    this.changeInterval = null;
  }
};

NotifyCharacteristic.prototype.onNotify = function() {
  console.log('NotifyCharacteristic on notify');
};

function SampleService() {
  SampleService.super_.call(this, {
    uuid: 'f000cc40-0451-4000-b000-000000000000',
    characteristics: [
      new DigitalSignatureCharacteristic(),
      new WriteTokenChunkCharacteristic(),
      new WriteLastTokenChunkCharacteristic(),
      new NotifyCharacteristic()
    ]
  });
}

util.inherits(SampleService, BlenoPrimaryService);

bleno.on('stateChange', function(state) {
    console.log('on -> stateChange: ' + state);
    
    if (state === 'poweredOn') {
        bleno.startAdvertising('raspy', ['f000cc40-0451-4000-b000-000000000000']);
    } else {
        bleno.stopAdvertising();
    }
});

// Linux only events /////////////////
bleno.on('accept', function(clientAddress) {
  console.log('on -> accept, client: ' + clientAddress);

  //bleno.updateRssi();
  
  dataBuffer = null;
});

bleno.on('disconnect', function(clientAddress) {
  console.log('on -> disconnect, client: ' + clientAddress);
});

bleno.on('rssiUpdate', function(rssi) {
  console.log('on -> rssiUpdate: ' + rssi);
});
//////////////////////////////////////

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if (!error) {
    bleno.setServices([
      new SampleService()
    ]);
  }
});

bleno.on('advertisingStop', function() {
  console.log('on -> advertisingStop');
});

bleno.on('servicesSet', function() {
  console.log('on -> servicesSet');
});

module.exports = function(listener){
    _listener = listener;
};