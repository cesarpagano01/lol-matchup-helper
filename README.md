# projeto-base

clona o projeto

roda yarn

copia a porra do env example para .env

docker compose up --build

docker compose exec yarn knex migrate:latest

docker exec -it node_app_lol yarn knex migrate:make migration_name
