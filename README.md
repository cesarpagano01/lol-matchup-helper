# projeto-base

clona o projeto

roda yarn

copia o .env.example para .env

docker compose up --build
docker compose up -d
docker compose down

docker compose exec app yarn knex migrate:latest
docker compose exec app yarn knex migrate:rollback

docker compose exec app yarn knex migrate:make migration_name
