# See here: https://vuejs.org/v2/cookbook/dockerize-vuejs-app.html
#           https://mherman.org/blog/dockerizing-a-vue-app/
#           
# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
ADD package-prod.json ./package.json
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
