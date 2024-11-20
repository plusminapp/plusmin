ARG POSTGRES_PASSWORD
FROM bitnami/postgresql:16

ENV POSTGRES_USER=pm
ENV POSTGRES_DB=pm
ENV LANG=nl_NL.utf8

USER root

COPY resources/.pgpass .pgpass
RUN chown 1001:root .pgpass
RUN chmod 0600 .pgpass

RUN mkdir -p /bitnami/postgresql/data
RUN chown 1001:root /bitnami/postgresql/data

RUN localedef -i nl_NL -c -f UTF-8 -A /usr/share/locale/locale.alias nl_NL.UTF-8

USER 1001

EXPOSE 5432
