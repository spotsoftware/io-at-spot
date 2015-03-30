#!/bin/sh
#/etc/init.d/doorkeeper

export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules

case "$1" in
  start)
  exec sudo forever start --sourceDir=/home/pi/io-at-spot/doorkeeper/deploy/ -p /home/pi/io-at-spot/doorkeeper/logs -l forever.log -a -w --killSignal SIGINT socket.js
  ;;
stop)
  exec sudo forever stop /home/pi/io-at-spot/doorkeeper/deploy/socket.js
  ;;
*)
  echo "Usage: /etc/init.d/doorkeeper {start|stop}"
  exit 1
  ;;
esac

exit 0

