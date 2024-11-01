#!/usr/bin/env bash

echo pm-frontend version: ${VERSION}

pushd ${PROJECT_FOLDER}/pm-frontend

docker build -t rimvanvliet/pm-frontend:${VERSION} .

popd