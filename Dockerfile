FROM node:lts

EXPOSE 8000

RUN useradd crumbl-hoster --home /home/crumbl-hoster
WORKDIR /home/crumbl-hoster
RUN chown -R crumbl-hoster /home/crumbl-hoster

COPY . .
RUN npm i
USER crumbl-hoster

CMD ["npm", "start"]