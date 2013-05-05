#!/bin/bash

TOKEN=$(./login.sh | jshon -e token -u)
TO="danigm@gmail.com"
MSG="OLA K ASE"
echo "Talking to $TO"
curl -X "POST" -d "token=$TOKEN&to=$TO&msg=$MSG" http://localhost:5000/send
