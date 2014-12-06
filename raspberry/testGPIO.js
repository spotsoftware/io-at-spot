var Gpio = require('onoff').Gpio,
    redLed = new Gpio(24, 'out'),
    greenLed = new Gpio(23, 'out'),
    relay = new Gpio(22, 'out'),
    buzzer = new Gpio(18, 'out'),
    iv;

//init operations. The relay is active-low, so we need to ensure that the 
//value in output is high.
//relay.writeSync(1);
//buzzer.writeSync(0);


iv = setInterval(function() {
    redLed.writeSync(redLed.readSync() === 0 ? 1 : 0);
    relay.writeSync(relay.readSync() === 0 ? 1 : 0);
    greenLed.writeSync(greenLed.readSync() === 0 ? 1 : 0);
    buzzer.writeSync(buzzer.readSync() === 0 ? 1 : 0);
}, 500);

// Stop blinking the LED and turn it off after 5 seconds.
setTimeout(function() {
    clearInterval(iv); // Stop blinking
    stop(redLed);
    stop(greenLed);
    stop(buzzer);
    stop(relay);
}, 4000);

function stop(gp){
    gp.writeSync(0);
    gp.unexport();
}

function test(){
    greenLed.writeSync(1);
    redLed.writeSync(1);
    buzzer.writeSync(1);
    relay.writeSync(1);
    
    setInterval(function(){
        greenLed.writeSync(0);
        redLed.writeSync(0);
        buzzer.writeSync(0);
        relay.writeSync(0);
    }, 1000);
}