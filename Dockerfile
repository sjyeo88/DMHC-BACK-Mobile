FROM node:6.2.2

MAINTAINER xx <XX>

RUN mkdir -p /app

WORKDIR /app

ADD . /app


RUN npm install

ENV NODE_ENV development
EXPOSE 3000 


CMD ["npm", "start"]
