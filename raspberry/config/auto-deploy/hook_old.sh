#!/bin/sh

# First, get the zip file
cd /home/pi/io-at-spot && wget -O deploy.zip -q https://github.com/spotsoftware/io-at-spot/archive/deploy.zip

# Second, unzip it, if the zip file exists
if [ -f /home/pi/io-at-spot/deploy.zip ]; then
    # Unzip the zip file
    unzip -q /home/pi/io-at-spot/deploy.zip
    echo 'unzipping file'
    # Delete zip file
    rm /home/pi/io-at-spot/deploy.zip

    #move inside dir
    cd io-at-spot-deploy

    # Rename project directory to desired name
    mv raspberry deploy

    #ANDREA merge deploy:
    echo 'stopping service'
    sudo /etc/init.d/nodeup stop

    echo 'rsyncing'
    rsync -av deploy/ /home/pi/io-at-spot/deploy/
    #(after checking)
    cd .. && sudo rm -rf io-at-spot-deploy

    cd /home/pi/io-at-spot/deploy/
    echo 'installing dependencies'
    sudo npm install

    echo 'restarting service'
    sudo /etc/init.d/nodeup start

    echo 'end'
    #END:

    # Perhaps call any other scripts you need to rebuild assets here
    # or set owner/permissions
    # or confirm that the old site was replaced correctly

fi
