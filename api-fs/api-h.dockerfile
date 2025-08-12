FROM node:20-alpine3.19

ENV API_KEY=47f2ac60-6b77-4e12-ae38-577275cfa621 \
    API_LISTEN_PORT=3008 \
    DB_USERNAME=postgres \
    DB_HOST=postgreshost \
    DB_NAME=foodstall \
    DB_PASSWORD=password \
    DB_PORT=5432

RUN mkdir /app

COPY . /app

WORKDIR /app

RUN npm install

CMD [ "node", "index.js" ]