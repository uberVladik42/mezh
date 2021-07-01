FROM python:3.8
MAINTAINER Dmitry Paramonov <paramonov@informatics.ru>
ADD ./ /pfs102_institutum_virtual
WORKDIR /pfs102_institutum_virtual/
RUN apt-get update && apt-get install -y build-essential nano python3-dev default-libmysqlclient-dev
RUN pip install --no-cache-dir -r ./requirements.txt
CMD chmod 777 ./docker/run.sh
CMD exec ./docker/run.sh
