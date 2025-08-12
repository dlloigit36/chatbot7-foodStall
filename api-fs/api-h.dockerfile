FROM node:20-alpine3.19

RUN mkdir /app

COPY . /app

WORKDIR /app

RUN npm install

CMD [ "node", "index.js" ]