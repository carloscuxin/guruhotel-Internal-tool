FROM node:16.14
WORKDIR /code
COPY . /code
RUN npm install
CMD npm run dev