FROM node:lts

EXPOSE 8000

RUN useradd hoster --home /home/hoster
WORKDIR /home/hoster
RUN chown -R hoster /home/hoster
USER hoster

COPY . .
RUN npm i

CMD ["npm", "start"]