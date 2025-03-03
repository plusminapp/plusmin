#!/bin/bash

cat $1 | docker exec -i pm-database psql -U pm pm