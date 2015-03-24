#!/bin/sh
#/etc/init.d/nodeup

export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules

case "$1" in
  start)
  exec sudo forever start --sourceDir=/home/pi/Adafruit-WebIDE/repositories/pi-projects/node-server/ -p /opt/local/.forever -w --killSignal SIGINT socket.js
  #exec sudo forever --sourceDir=/home/pi/Adafruit-WebIDE/repositories/pi-projects/node-server/ -w -p /opt/local/.forever socket.js
  ;;
stop)
  exec sudo forever stop --sourceDir=/home/pi/Adafruit-WebIDE/repositories/pi-projects/node-server/ socket.js
  ;;
*)
  echo "Usage: /etc/init.d/nodeup {start|stop}"
  exit 1
  ;;
esac

exit 0

