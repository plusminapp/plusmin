#!/bin/bash

# $1 = dev/stg
# $2 = frontend/backend

printf "Starting deploy stage: $1 $2\n"
docker compose -f docker-compose.$1.yml down $2 
printf "\nRestarting\n"
docker compose -f docker-compose.$1.yml up -d