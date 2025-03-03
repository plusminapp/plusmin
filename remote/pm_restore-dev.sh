#!/bin/bash

cat $1 | docker exec -i pm-database-dev psql -U pm pm