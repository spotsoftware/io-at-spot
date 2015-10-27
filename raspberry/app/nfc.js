var logger = require('./logger');
var _listener = null;
var usb = require('usb');
var pythonShell = require('python-shell');
var count = 0;

function cleanUsbDevice(nfc_reader) {
    nfc_reader.open();
    nfc_reader.reset(function(err) {
        if (err) throw err;
        nfc_reader.reset(function(err) {
            if (err) throw err;
            setTimeout(function() {
                nfc_reader.close();
                usbNfcRead();
            }, 3000);
        });
    });
}

function usbNfcRead() {
    var nfc_reader = usb.findByIds(1839, 8704);

    count++;
    pythonShell.run('python/tag_reader.py', { args: ['usb'] }, function(err, results) {
        if (err) {
            cleanUsbDevice(nfc_reader);
            logger.warn(err, 'nfc reader error');
        } else {
            // results is an array consisting of messages collected during execution
            logger.debug('tag read uid: %j', results, count);

            _listener.onNFCTagSubmitted(results[0]);

            usbNfcRead();
        }
    });
}

function uartNfcRead(){
    pythonShell.run('python/tag_reader.py', { args: ['tty:AMA0:pn53x'] }, function(err, results) {
        if (err) {
            throw err;
        } else {
            // results is an array consisting of messages collected during execution
            logger.debug('tag read uid: %j', results, count);

            _listener.onNFCTagSubmitted(results[0]);

            uartNfcRead();
        }
    });
}

usbNfcRead();
uartNfcRead();

module.exports = function(listener) {
    _listener = listener;
};