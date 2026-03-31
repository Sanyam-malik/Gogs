FROM gogs/gogs:latest

USER root

# Copy theme folder
COPY /themes ./themes

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]