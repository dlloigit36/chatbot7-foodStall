# This project consisted of
1. api module inside folder "api-fs" as back-end API module to create/read/update/delete Postgresql database record
2. web module inside folder "web-fs" as front-end user interface, where food stall operator login to manage waiting number.
3. web module inside folder "web-fs-agent" as back-end module for admin/agent to create new user, manage user/food stall operator details.


# Notes
1. This repo do not include back-end database or Postgresql database. DB design refer "db-design-FS.png".
2. SQL command to create needed database, tables and some sample data, can be found in file "db-command.sql"
3. wait_number record expected to be from Whatsapp chatbot module (not in this repo).
4. API or web modules need .env (not in this repo) file to function

# To run:
1. start postgresql docker image
```
agu88@MSI MINGW64 /c/01-web-dev/project-docker-postgresql
$ docker compose up -d
```
docker compose file docker-compose.yml
```
services:

  postgres:
    image: "postgres:16.4-alpine3.19"
    ports:
      - "5432:5432"
    restart: always
    deploy:
      mode: replicated
      replicas: 1
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: foodstall
    volumes:
      - ./db-data/postgres/:/var/lib/postgresql/data/
```
2. start api
```
agu88@MSI MINGW64 /c/01-web-dev/project-chatbot7-foodstall/api-fs (main)
$ nodemon --env-file .env index.js 
```
.env file content
```
# .env file
API_KEY=47f2ac60-6b77-4e12-ae38-577275cfa621
API_LISTEN_PORT=3008
DB_USERNAME=postgres
DB_HOST=localhost
DB_NAME=foodstall
DB_PASSWORD=password
DB_PORT=5432
```
3. start fs web server
```
agu88@MSI MINGW64 /c/01-web-dev/project-chatbot7-foodstall/web-fs (main)
$ nodemon --env-file .env index.js 
```
.env file content
```
# .env file
WEB_PORT=3018
API_ACCESS_KEY=47f2ac60-6b77-4e12-ae38-577275cfa621
API_HOSTNAME=localhost
API_PORT=3008
SESSION_SECRET="TOPJOKEOFTHEDAY"

```
4. for egent management, start
```
agu88@MSI MINGW64 /c/01-web-dev/project-chatbot7-foodstall/web-fs-agent (main)
$ nodemon --env-file .env index.js
```
.env content
```
# .env file
WEB_PORT=3028
API_ACCESS_KEY=47f2ac60-6b77-4e12-ae38-577275cfa621
API_HOSTNAME=localhost
API_PORT=3008
SESSION_SECRET="TOPSECRETOFTHEYEAR"

```
    4.1 logon url http://localhost:3028/login
    4.2 for admin to manage agents http://localhost:3028/agent
    4.3 for agent to manage user/stall owner. http://localhost:3028/agent 
    4.4 agent/admin profile hardcoded into table agent_detail > profile#
