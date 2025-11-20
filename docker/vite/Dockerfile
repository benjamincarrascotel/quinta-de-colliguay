# docker/vite/Dockerfile
FROM node:22-alpine3.20

RUN apk upgrade --no-cache \
    && apk add --no-cache bash

WORKDIR /app

ENV HOST=0.0.0.0 \
    CHOKIDAR_USEPOLLING=false \
    WATCHPACK_POLLING=false \
    NPM_CONFIG_CACHE=/tmp/.npm

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm ci && \
    mkdir -p /opt/app_node_modules && \
    cp -a node_modules/. /opt/app_node_modules/ && \
    cp -a package-lock.json /opt/package-lock.json

COPY docker/vite/vite-entrypoint.sh /usr/local/bin/vite-entrypoint.sh
RUN chmod +x /usr/local/bin/vite-entrypoint.sh

EXPOSE 5173 24678
ENTRYPOINT ["/usr/local/bin/vite-entrypoint.sh"]
CMD ["npm","run","dev"]