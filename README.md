# projeto-base

clona o projeto

roda yarn

copia a porra do env example para .env

docker compose up --build

docker compose exec app yarn knex migrate:latest

docker compose exec app yarn knex migrate:make migration_name
