#!/usr/bin/env bash

echo pm-database version: ${VERSION}

pushd ${PROJECT_FOLDER}/pm-database

docker build \
     --build-arg PLATFORM=${PLATFORM}  \
     -t rimvanvliet/pm-database:${VERSION} .

popd