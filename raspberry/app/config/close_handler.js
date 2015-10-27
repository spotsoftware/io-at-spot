var sys = require('sys'),
    exec = require('child_process').exec,
    logger = require('../logger');

process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, err) {
    if (options.cleanup) {
        exec("killall l2cap-ble");
        logger.warn('cleaning nfcpy and ble child processes');
    }
    if (err) {
        console.log(err);
        logger.fatal(err, "error");
    }

    if (options.exit) {
        logger.warn('closing process.');
        setTimeout(function () {
            process.exit();
        }, 500);
    }
}

//do something when app is closing
/*
process.on('exit', exitHandler.bind(null, {
    cleanup: true,
    exit: true
}));
*/

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {
    cleanup: true,
    exit: true
}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
    cleanup: true,
    exit: true
}));