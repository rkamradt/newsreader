FROM node:22-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

CMD [ "node", "app.js" ]
