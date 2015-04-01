#!/bin/sh

# First, get the zip file
cd /home/pi/io-at-spot && wget -O deploy.zip -q https://github.com/spotsoftware/io-at-spot/archive/deploy.zip

# Second, unzip it, if the zip file exists
if [ -f /home/pi/io-at-spot/deploy.zip ]; then
    # Unzip the zip file
    echo 'unzip'
    unzip -q /home/pi/io-at-spot/deploy.zip

    # Delete zip file
    rm /home/pi/io-at-spot/deploy.zip

    #move inside dir
    cd io-at-spot-deploy/raspberry

    # Rename project directory to desired name
    mv app deploy

    #move install dependencies
    cd deploy

    #saving old node_modules and config file
    cp -r /home/pi/io-at-spot/doorkeeper/deploy/node_modules node_modules
    cp -r /home/pi/io-at-spot/doorkeeper/deploy/config/config.js config/config.js

    echo 'npm install'
    #install dependencies
    sudo npm install

    #Stopping service
    sudo /etc/init.d/doorkeeper stop
    
    # Delete current deploy directory
    rm -rf /home/pi/io-at-spot/doorkeeper/deploy

    #move up
    cd ..

    echo 'replacing deploy dir'
    # Replace with new files
    mv deploy /home/pi/io-at-spot/doorkeeper/

    cd /home/pi/io-at-spot
    rm -rf io-at-spot-deploy      
    
    #Starting service
    sudo /etc/init.d/doorkeeper start

    # Perhaps call any other scripts you need to rebuild assets here
    # or set owner/permissions
    # or confirm that the old site was replaced correctly

fi

echo 'end'
