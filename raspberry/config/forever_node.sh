#!/bin/sh
#/etc/init.d/nodeup

export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules

case "$1" in
  start)
  exec sudo forever start --sourceDir=/home/pi/io-at-spot/deploy/ -p /home/pi/io-at-spot/forever/doorkeeper -l forever.log -a -w --killSignal SIGINT socket.js
  exec sudo forever start --sourceDir=/home/pi/io-at-spot/deployer/ -p /home/pi/io-at-spot/forever/deployer -l forever.log -a -w --killSignal SIGINT hook.js
  #exec sudo forever --sourceDir=/home/pi/Adafruit-WebIDE/repositories/pi-projects/node-server/ -w -p /opt/local/.forever socket.js
  ;;
stop)
  exec sudo forever stop /home/pi/io-at-spot/deploy/socket.js
  exec sudo forever stop /home/pi/io-at-spot/deployer/hook.js
  ;;
*)
  echo "Usage: /etc/init.d/nodeup {start|stop}"
  exit 1
  ;;
esac

exit 0

