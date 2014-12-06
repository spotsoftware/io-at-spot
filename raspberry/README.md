Raspberry pi device
=================

Bluetooth LE & NFC door-opener application for Raspberry pi

This program is built to transform a fully equipped raspberry pi into a smart device for access control 

For smartphone interaction it uses an Adafruit PN532 Breakout board and a standard Bluetooth 4.0 USB adapter.

For door opening and audio feedback, a custom circuit linked to GPIO pins.

Hardware prerequisites
--------------
* Connect Adafruit PN532 breakout board to Raspberry pi using UART PINs. Remember to free the UART in Raspbian (https://learn.adafruit.com/adafruit-nfc-rfid-on-raspberry-pi/freeing-uart-on-the-pi) 
* Connect the Bluetooth 4.0 USB Adapter to USB port
* This is the circuit to build. A green led, a red led, a buzzed and a relay. Each controlled by a separate GPIO pin. Remember to set the correct PIN that you're using in actuator.js file.
![alt tag](http://s4.postimg.org/q1j6rz67x/proto_circuit.jpg)
Software prerequisites
--------------

* Install last version of raspbian os on your raspberry-pi
* Open shell
* Install pip for python 2.7
* Install nfcpy 
```sh
#install pyserial
sudo pip install pyserial
#install launchpad bazaar Version Control System
sudo apt-get install bzr
#enters the dir
md nfcpy & cd nfcpy
#get the branch of nfcpy
bzr branch lp:nfcpy
```
* Test installation of nfcpy
```sh
$  cd nfcpy/examples
$  python tagtool.py --device tty:AMA0:pn53x show
```
* Install blueZ 4.101 from sources
```sh
wget http://www.kernel.org/pub/linux/bluetooth/bluez-4.101.tar.xz
tar -xvf bluez-4.101.tar.xz
cd bluez-4.101
./configure 
sudo make
sudo make install
```

* Test installation of blueZ:
```sh
hciconfig 
```
should results in something like:
```sh
hci0:   Type: BR/EDR  Bus: USB
         BD Address: 00:1A:7D:DA:71:0C  ACL MTU: 310:10  SCO MTU: 64:8
     DOWN 
     RX bytes:467 acl:0 sco:0 events:18 errors:0
     TX bytes:317 acl:0 sco:0 commands:18 errors:0 
```

* Install node.js (precompiled version)
```sh
sudo wget http://node-arm.herokuapp.com/node_latest_armhf.deb
sudo dpkg -i node_latest_armhf.deb
```

* Test installation of node.js
```sh
node -v 
```
should results in something like:
```sh
v0.10.24
```

Installation
------------

* Clone repo of this project
```sh
git clone https://github.com/spotsoftware/io-at-spot.git
cd raspberry
```

* Setup bluetoothd daemon as a startup service
```sh
sudo cp config/startup.sh /etc/init.d/bluetoothd
sudo chmod uog+rx /etc/init.d/bluetoothd
sudo update-rc.d bluetoothd defaults
```
If you ever want to stop this service from executing on boot
```sh
sudo update-rc.d bluetoothd defaults
```

* Install npm packages
```sh
sudo npm install
```

Run
---

```sh
sudo node socket.js
```

