FROM python:3.14-alpine3.23

COPY ./src /app/src
COPY ./main.py /app/main.py
COPY ./requirements.txt /app/requirements.txt

WORKDIR /app

RUN pip install -r requirements.txt

ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]