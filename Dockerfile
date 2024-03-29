FROM node:alpine

RUN mkdir -p /usr/src/node-app && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json yarn.lock ./

USER node

RUN npm install --os=darwin --cpu=arm64 sharp

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 3000
