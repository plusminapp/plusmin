#!/usr/bin/env bash

source .env

VERSION=PM_$2_VERSION
echo version: $VERSION

docker save -o .images/pm-$1.${VERSION}.tar rimvanvliet/pm-$1:${VERSION}
scp .images/pm-$1.${VERSION}.tar box:~/.images/
ssh box "docker load -i ~/.images/pm-$1.${VERSION}.tar"

