FROM node:23-alpine AS mailmate

USER node
WORKDIR /home/node

COPY --chown=node:node . ./
RUN npm ci
EXPOSE 3000
