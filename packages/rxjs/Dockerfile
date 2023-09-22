FROM node:lts

# Create app directory
WORKDIR /rxjs

COPY . .

WORKDIR /rxjs/apps/rxjs.dev

RUN yarn setup

EXPOSE 4200

CMD ["npm", "start:docker"]