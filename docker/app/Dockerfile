# docker/app/Dockerfile
FROM laravel_base_php

# Add postgres client and supervisor for process management
RUN apk add --no-cache postgresql-client supervisor

WORKDIR /var/www/html

# Copy supervisor configuration
COPY docker/app/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Container entrypoint utilities
COPY docker/app/entrypoint.sh /usr/local/bin/app-entrypoint.sh
COPY docker/app/composer-install.sh /usr/local/bin/project-composer-install
RUN chmod +x /usr/local/bin/app-entrypoint.sh /usr/local/bin/project-composer-install

EXPOSE 8000
ENTRYPOINT ["/usr/local/bin/app-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
