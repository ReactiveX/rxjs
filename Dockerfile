FROM node:lts

# Create app directory
WORKDIR /rxjs

COPY . .

WORKDIR /rxjs/docs_app

RUN npm run setup

EXPOSE 4200

CMD ["npm", "start:docker"]