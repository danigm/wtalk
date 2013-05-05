#!/bin/bash

TOKEN=$(./login.sh | jshon -e token -u)
curl -X "POST" -d "token=$TOKEN" http://localhost:5000/contacts
