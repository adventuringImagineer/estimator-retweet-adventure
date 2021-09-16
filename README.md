## Introduction

The Estimator is a hardware-accelerated machine-learning microservice capable of making classifications, predictions, etc. in a changing environment in real time. 
<br /> This app uses the estimator to classify whether tweets will be retweeted or not.

This app can be run locally by CDing into the 'estimator-retweet-adventure' directory and running
  <br /> $ docker build -t est-tweet .
  <br /> $ docker run -p 80:80 est-tweet

However, it has also been deployed to an AWS free-tier server and can be accessed at the following url:
  <br /> http://54.92.174.201/test