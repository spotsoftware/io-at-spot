#!/bin/sh
cd ..
git pull "origin" $1
cd raspberry
npm install
return
