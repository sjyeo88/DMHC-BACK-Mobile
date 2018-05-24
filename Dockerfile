FROM node:6.2.2

MAINTAINER xx <XX>

RUN npm install -g pm2 node-gyp
RUN mkdir -p /app

WORKDIR /app

ADD . /app


RUN npm install

ENV NODE_ENV production
EXPOSE 3001


CMD ["pm2-docker", "bin/www"]
