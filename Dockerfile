# Nerdesign-nettstedet på nerdesign.offline.no. Serverer nettsted/ (bygd og committet av tools/deploy.sh,
# med frosne versjoner i nettsted/vX.Y.Z/). Statisk, Caddy på port 3000, uten root.
FROM caddy:2.11.6-alpine
ENV XDG_DATA_HOME=/tmp/caddy-data XDG_CONFIG_HOME=/tmp/caddy-config
COPY Caddyfile /etc/caddy/Caddyfile
COPY nettsted/ /srv/
USER 65534:65534
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:3000/healthz || exit 1
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
