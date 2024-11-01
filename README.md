# This project consisted of
1. api module inside folder "api-fs" as back-end API module to create/read/update/delete Postgresql database record
2. web module inside folder "web-fs" as front-end user interface, where food stall operator login to manage waiting number.
3. web module inside folder "web-fs-agent" as back-end module for admin/agent to create new user, manage user/food stall operator details.


# Notes
1. This repo do not include back-end database or Postgresql database.
2. SQL command to create needed database, tables and some sample data, can be found in file "db-command.sql"
3. wait_number record expected to be from Whatsapp chatbot module (not in this repo).
4. API or web modules need .env (not in this repo) file to function