from flask import Flask, render_template, json
from retweet.py import config
import tweepy
import json
import retweet.tweet_ex as tweet_ex
from retweet import create_app

app = create_app()

# Creating the API object while passing in auth information
auth = tweepy.OAuthHandler(config.tweepy_consumer_key,
                           config.tweepy_consumer_secret)

# # Setting your access token and secret
auth.set_access_token(config.tweepy_access_token,
                      config.tweepy_access_token_secret)

api = tweepy.API(auth, wait_on_rate_limit=True)
# status = api.get_status(tweet_mode="extended")

# the max number of tweets to retrieve from the Twitter API
MAX_TWEETS = 40
# the keyword(s) to search for tweets,
# can use "OR" to find tweets that have any of the keywords
# or "AND" to find only tweets that reference all keywords
QUERY_KEYWORDS = ['machine-learning OR machine learning OR AI OR throughputer']
# The max number of followers for a twitter user to do the prediction calculations, did not see actual limit
# However, 100000 has worked well in these calculations
MAX_FOLLOWER_COUNT = 100000


###
# This function will get MAX_TWEETS from the twitter API using the QUERY_KEYWORDS
# given above and return them with the tweets full text, using "tweet_mode:extended"
#
# @return: list of tweets with metadata
###
def get_tweets():
    return tweet_ex.get_ex_tweets() + [status._json for status in tweepy.Cursor(api.search,  q=QUERY_KEYWORDS, tweet_mode="extended", languages=["en"]).items(MAX_TWEETS)]


##
# This function will extract the original tweeters information from the nested
# twitter data
#
# @param: searched_tweets: the dict of nested tweet information
# @return: the original tweeters user information
##
def get_user_info(searched_tweets):
    user_info = []
    try:
        for i in searched_tweets:
            if 'retweeted_status' in i:
                user_info.append(i['retweeted_status']['user'])
            else:
                user_info.append(i['user'])
    except:
        print('could not get twitter user data')
    return user_info

##
# This function will extract the original tweeters information from the nested
# twitter data
#
# @param: searched_tweets: the dict of nested tweet information
# @return: the original tweeters user information
##


def get_tweet_info(searched_tweets):
    tweet_info = ""
    full_text = []
    try:
        for i in searched_tweets:
            if 'retweeted_status' in i:
                tweet_info = i['retweeted_status']['full_text'].encode(
                    "ascii", "ignore")
                tweet_info = tweet_info.decode()
                tweet_info = tweet_info.replace('\n', '<br />')
                full_text.append(tweet_info)
            else:
                tweet_info = i['full_text'].encode("ascii", "ignore")
                tweet_info = tweet_info.decode()
                tweet_info = tweet_info.replace('\n', '<br />')
                full_text.append(tweet_info)
    except:
        print('could not get tweets full_text data')
    full_text = json.dumps(full_text)
    return full_text

###
# This function will take a number and convert it to a scale
# from 0-255 based on the max number in range and the min number in
# range
#
# @param: the number to be converted
# @return: the quantified number
###


def quantify_data(data):
    data = ((data - 0) / (MAX_FOLLOWER_COUNT - 0) * (255 - 0) + 0)
    if (data <= 64):
        data = 0
    elif (data > 64 and data <= 128):
        data = 1
    else:
        data = 2
    return data

##
# This takes certain twitter metrics and quantifies the data for a scale of 0-255
# and then divides it by the number of metrics to determine the likelihood of
# a tweet being retweeted: 2 for definite retweet, 1 for probable retweet, 0 for no retweet
#
# @param user: the dict of user data for each tweet
# @return user_data: the list of determinations (0 or 1) for each tweet
##


def normalized_user_data(user):
    user_data = []
    for i in user:
        est1 = quantify_data(i['followers_count'])
        est2 = (2 if i['verified'] else 0)
        if ((i['friends_count'] < i['followers_count']) and ((i['followers_count'] - i['friends_count']) >= 1000)):
            est3 = 2
        elif ((i['friends_count'] < i['followers_count']) and ((i['followers_count'] - i['friends_count']) < 1000)):
            est3 = 1
        else:
            est3 = 0
        user_data.append([est1, est2, est3])

    return user_data


@app.route('/test', methods=['GET', 'PUT'])
def test():
    searched_tweets = get_tweets()
    user = get_user_info(searched_tweets)
    payload = normalized_user_data(user)
    text = get_tweet_info(searched_tweets)
    retweeted = []
    screennames = []
    names = []
    for i in user:
        name = i['name'].encode("ascii", "ignore")
        names.append(name.decode())
        screenname = i['screen_name'].encode("ascii", "ignore")
        screennames.append(screenname.decode())

    for i in searched_tweets:
        if (i['retweet_count'] > 10):
            retweeted.append(2)
        elif (i['retweet_count'] > 0 and i['retweet_count'] <= 10):
            retweeted.append(1)
        else:
            retweeted.append(0)

    return render_template('retweet.html', payload=payload, retweeted=retweeted, text=text, screenname=screennames, name=names, url=config.estimator_url)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
