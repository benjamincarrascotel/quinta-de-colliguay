# Dockerfile.php83-intl
FROM php:8.2-cli-alpine

# PHP extensions and dependencies for intl/zip/pgsql/gd, with temporary build deps
RUN apk add --no-cache icu-dev libzip-dev postgresql-dev oniguruma-dev \
    freetype-dev libjpeg-turbo-dev libpng-dev libwebp-dev \
    linux-headers git curl unzip bash \
 && apk add --update --no-cache --virtual .build-dependencies $PHPIZE_DEPS \
 && docker-php-ext-configure intl \
 && docker-php-ext-configure zip \
 && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
 && docker-php-ext-install -j"$(nproc)" intl zip bcmath pcntl mbstring pdo pdo_pgsql gd \
 # Install Xdebug (but don't enable by default)
 && pecl install xdebug \
 && pecl clear-cache \
 # Clean up build deps to keep image lightweight
 && apk del .build-dependencies

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
