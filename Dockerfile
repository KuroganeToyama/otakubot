FROM node:18-alpine

# Create app directory
WORKDIR /usr/app

# Install app dependencies
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

COPY . .

# Start the bot
CMD [ "yarn", "run", "local:run" ]