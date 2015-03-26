#!/bin/sh
#/etc/init.d/deployer

export PATH=$PATH:/usr/local/bin
export NODE_PATH=$NODE_PATH:/usr/local/lib/node_modules

case "$1" in
  start)
  exec sudo forever start --sourceDir=/home/pi/io-at-spot/deployer/ -p /home/pi/io-at-spot/deployer -l forever.log -a --killSignal SIGINT hook.js
  ;;
stop)
  exec sudo forever stop /home/pi/io-at-spot/deployer/hook.js
  ;;
*)
  echo "Usage: /etc/init.d/deployer {start|stop}"
  exit 1
  ;;
esac

exit 0

