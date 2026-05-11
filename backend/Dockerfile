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

ENTRYPOINT ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]