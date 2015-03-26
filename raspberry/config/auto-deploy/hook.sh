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
    cd io-at-spot-deploy

    # Rename project directory to desired name
    mv raspberry deploy

    #move install dependencies
    cd deploy

    #saving old node_modules and config file
    mv /home/pi/io-at-spot/deploy/node_modules node_modules
    mv /home/pi/io-at-spot/deploy/config/config.js config/config.js

    echo 'npm install'
    #install dependencies
    sudo npm install

    # Delete current deploy directory
    rm -rf /home/pi/io-at-spot/deploy

    #move up
    cd ..

    echo 'replacing deploy dir'
    # Replace with new files
    mv deploy /home/pi/io-at-spot/

    cd /home/pi/io-at-spot
    rm -rf io-at-spot-deploy       

    # Perhaps call any other scripts you need to rebuild assets here
    # or set owner/permissions
    # or confirm that the old site was replaced correctly

fi

echo 'end'
