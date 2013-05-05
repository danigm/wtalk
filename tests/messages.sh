#!/bin/bash

TOKEN=$(./login.sh | jshon -e token -u)
echo "Tell me something"
sleep 10 #waiting for messages
curl -X "POST" -d "token=$TOKEN" http://localhost:5000/messages
