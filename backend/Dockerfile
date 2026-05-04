#FROM python:3.11-alpine3.23
FROM pytorch/pytorch:2.11.0-cuda13.0-cudnn9-runtime

#RUN apk add build-base

COPY ./src /app/src
COPY ./main.py /app/main.py
COPY ./requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip install -r requirements.txt --break-system-packages

ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]