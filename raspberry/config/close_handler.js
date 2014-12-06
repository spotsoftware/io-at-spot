var sys = require('sys'),
    exec = require('child_process').exec;

process.stdin.resume(); //so the program will not close instantly

function exitHandler(options, err) {
    
    if (options.cleanup) {
        exec("killall l2cap-ble");
        exec("killall python");
        console.log('clean');
    }
    if (err) console.log(err.stack);
    if (options.exit) process.exit();
}

console.log('registering closing handlers');

//do something when app is closing
process.on('exit', exitHandler.bind(null, {
    cleanup: true
}));

//catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {
    exit: true
}));

//catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
    exit: true
}));