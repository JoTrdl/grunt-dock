#!/bin/bash

sed -i "s/upstream node {server .*;}/upstream node {server $LATEST_PORT_8080_TCP_ADDR:$LATEST_PORT_8080_TCP_PORT;}/" /etc/nginx/sites-available/default
nginx -g "daemon off;"