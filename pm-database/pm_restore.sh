cat $1 | docker exec -i pm-database psql postgresql://pm:pm@localhost:5432
