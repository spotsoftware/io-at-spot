var Gpio = require('onoff').Gpio,
    relay = new Gpio(22, 'out'),
    redLed = new Gpio(24, 'out'),
    greenLed = new Gpio(23, 'out'),
    buzzer = new Gpio(18, 'out'),
    errorInterval = null,
    blinkingInterval = null;


function startBlinking(){
    // Toggle the state of the LED on GPIO #17 every 200ms.
    // Here synchronous methods are used. Asynchronous methods are also available.
    blinkingInterval = setInterval(function() {
        buzzer.writeSync(buzzer.readSync() === 0 ? 1 : 0);
        redLed.writeSync(redLed.readSync() === 0 ? 1 : 0);
        greenLed.writeSync(greenLed.readSync() === 0 ? 1 : 0);
    }, 300);
}

function stopBlinking(){
    clearInterval(blinkingInterval);
    buzzer.writeSync(0);
    greenLed.writeSync(0);
    redLed.writeSync(0);
}

function openDoor(){
    greenLed.writeSync(1);
    buzzer.writeSync(1);
    relay.writeSync(1);
    
    setTimeout(function(){
        greenLed.writeSync(0);
        buzzer.writeSync(0);
    }, 500);
    
    setTimeout(function(){        
        relay.writeSync(0);
    }, 1000);
}

function notifyOk(){
    greenLed.writeSync(1);
    buzzer.writeSync(1);
    
    setTimeout(function(){
        greenLed.writeSync(0);
        buzzer.writeSync(0);
    }, 250);
}

function error(){
    var cont=0;
    errorInterval = setInterval(function() {
        if(cont<6){
            redLed.writeSync(redLed.readSync() === 0 ? 1 : 0);
            buzzer.writeSync(buzzer.readSync() === 0 ? 1 : 0);
            cont++;
        }else{
            clearInterval(errorInterval);
        }
    }, 100);
}

//exposes the three "public" functions
exports.error = error;
exports.openDoor = openDoor;
exports.startBlinking = startBlinking;
exports.stopBlinking = stopBlinking;
exports.notifyOk = notifyOk;