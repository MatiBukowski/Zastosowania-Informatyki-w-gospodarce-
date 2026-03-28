FROM python:3.14-alpine3.23

COPY . /app

WORKDIR /app

RUN pip install -r requirements.txt

ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]