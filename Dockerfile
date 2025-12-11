FROM nginx:alpine
 
COPY . /usr/share/nginx/html
 
HEALTHCHECK --interval=30s --timeout=3s \

  CMD wget -qO- http://localhost:80/ >/dev/null || exit 1
 