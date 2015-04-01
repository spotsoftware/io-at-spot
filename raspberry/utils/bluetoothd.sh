#! /bin/sh
### BEGIN INIT INFO
# Provides:          
# Required-Start:    $all
# Required-Stop:     $remote_fs $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Manages the bluetoothd daemon
# Description:       Manages the bluetoothd daemon
### END INIT INFO

# Author:Andrea Corzani <andrea.corzani@spot.it>
#
# Please remove the "Author" lines above and replace them
# with your own name if you copy and modify this script.

# Do NOT "set -e"

# PATH should only include /usr/* if it runs after the mountnfs.sh script
PATH=/sbin:/usr/sbin:/bin:/usr/bin:/usr/local/bin

HCI=/usr/local/sbin/hciconfig
BLUETOOTH=/usr/local/sbin/bluetoothd
BLUE_PID=/var/run/bluetoothd.pid
BLUE_FILE="/var/log/bluetoothd.log"

PID=

BLUETOOTH_ENABLE=true

case "$1" in
start)
   if [ "$BLUETOOTH_ENABLE" = "true" ]; then
       #echo "Bringing up Bluetooth LE dongle"
       #$HCI hci0 up
       echo -n "Start bluetoothd... "
       $BLUETOOTH >> $BLUE_FILE 2>&1 &
       PID=$!
       echo "pid is $PID"
       echo $PID >> $BLUE_PID
    fi

    ;;
stop)

   if [ -e $BLUE_PID ]; then
       echo -n "Stop Bluetooth..."
       echo -n "killing "
       echo `cat $BLUE_PID`
       kill `cat $BLUE_PID`
       rm $BLUE_PID
   fi
   ;;
restart)
   $0 stop
   $0 start
        ;;
*)   echo "Usage: $0 (start|stop)"
        exit 1
        ;;
esac
exit 0