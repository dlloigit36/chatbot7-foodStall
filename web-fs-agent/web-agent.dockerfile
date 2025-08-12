FROM node:20-alpine3.19

ENV WEB_PORT=3028 \
    API_ACCESS_KEY=47f2ac60-6b77-4e12-ae38-577275cfa621 \
    API_HOSTNAME=apihost \
    API_PORT=3008 \
    SESSION_SECRET="TOPSECRETOFTHEYEAR"

RUN mkdir /app

COPY . /app

WORKDIR /app

RUN npm install

CMD [ "node", "index.js" ]