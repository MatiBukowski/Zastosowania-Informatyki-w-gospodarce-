FROM alpine:3.23 AS build

RUN apk add --no-cache git

WORKDIR /timesfm

RUN git clone https://github.com/google-research/timesfm.git

FROM pytorch/pytorch:2.2.2-cuda12.1-cudnn8-runtime

WORKDIR /timesfm

COPY --from=build /timesfm/timesfm .
RUN pip install .

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
RUN pip install -r requirements.txt

COPY ./src /app/src
COPY ./main.py /app/main.py
COPY ./alembic.ini /app/alembic.ini
COPY ./migrations /app/migrations
COPY ./entrypoint.sh /app/entrypoint.sh

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]