FROM node:8.11

WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY package.json /usr/src/app/

RUN npm install
RUN npm install -g typescript

COPY . /usr/src/app

EXPOSE 3333

RUN tsc

CMD [ "npm", "start" ]
