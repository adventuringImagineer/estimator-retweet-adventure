## Introduction

The Estimator is a hardware-accelerated machine-learning microservice capable of making classifications, predictions, etc. in a changing environment in real time. This app uses the estimator to classify whether tweets will be retweeted or not.

This app can be run locally by using cding into the 'estimator-lab-adv' directory and running
  $ docker build -t est-tweet .
  $ docker run -p 80:80 est-tweet

However, it has also been deployed to an AWS free-tier server and can be accessed at the following url:
  http://54.92.174.201/test