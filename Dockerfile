# encrypted-file-transfer/Dockerfile
# Dockerfile for NGINX, which is a web server
# that will serve the built React frontend of the application.

FROM nginx
COPY ./frontend/dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf