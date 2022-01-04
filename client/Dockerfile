FROM ubuntu:20.04

RUN apt-get update
RUN apt-get install software-properties-common -y
RUN add-apt-repository ppa:ethereum/ethereum
RUN apt-get update
RUN apt-get install solc -y

RUN apt-get install python3 python3-pip -y

WORKDIR /
COPY requirements.txt /
RUN pip install -r requirements.txt

COPY app /app


ENTRYPOINT python3 /app/app.py
