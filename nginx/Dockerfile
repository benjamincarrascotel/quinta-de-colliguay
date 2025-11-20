# Nginx Dockerfile (without embedded certs)
FROM nginx:1.27-alpine

RUN apk add --no-cache gettext

# Optional: remove default config
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy your main config as a template (actual file provided via volume)
COPY nginx.conf /etc/nginx/nginx.conf

# Ensure ACME webroot exists (volume will create it anyway, but doesn't hurt)
RUN mkdir -p /var/www/certbot

COPY entrypoint.sh /usr/local/bin/nginx-template-entrypoint
RUN chmod +x /usr/local/bin/nginx-template-entrypoint

ENTRYPOINT ["/usr/local/bin/nginx-template-entrypoint"]
