#!/bin/bash

TOKEN=$(./login.sh 2> /dev/null | jshon -e token -u)
while :
do
    sleep 20
    curl -X "POST" -d "token=$TOKEN" http://localhost:5000/ping
done
