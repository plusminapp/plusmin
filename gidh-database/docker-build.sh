#!/usr/bin/env bash

echo gidh-database version: ${VERSION}

pushd ${PROJECT_FOLDER}/gidh-database

docker build \
     --build-arg PLATFORM=${PLATFORM}  \
     -t rimvanvliet/gidh-database:${VERSION} .

popd