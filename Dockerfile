# Set base image (host OS)
FROM python:3.8-alpine

# By default, listen on port 80
EXPOSE 80

RUN mkdir -p /est-tweet

# Set the working directory in the container
WORKDIR /est-tweet

# Copy the dependencies file to the working directory
COPY requirements.txt /est-tweet

# Install any dependencies
RUN pip install -r requirements.txt

# Copy the content of the local src directory to the working directory
COPY . /est-tweet

# Specify the command to run on container start
# CMD [ "python3", "./retweet/app.py" ]
CMD ["gunicorn", "-c", "gunicorn_config.py", "retweet.wsgi:app"]