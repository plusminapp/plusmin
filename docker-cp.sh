#!/usr/bin/env bash

source .env

docker save -o .images/pm-$1.${PM_DEV_VERSION}.tar rimvanvliet/pm-$1:${PM_DEV_VERSION}
scp .images/pm-$1.${PM_DEV_VERSION}.tar box:~/.images/
ssh box "docker load -i ~/.images/pm-$1.${PM_DEV_VERSION}.tar"

