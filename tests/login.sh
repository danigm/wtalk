#!/bin/bash

read -s -p "Enter Password: " PASSWD
USER="dani"
DOMAIN="danigm.net"
data="username=$USER&passwd=$PASSWD&domain=$DOMAIN"

curl -X "POST" -d "$data" http://localhost:5000/login
