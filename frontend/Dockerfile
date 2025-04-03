FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY . .

RUN ls -la

# COPY nginx.conf /etc/nginx/nginx.conf

CMD ["nginx", "-g", "daemon off;"]