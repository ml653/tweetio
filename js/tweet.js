var Twit = require('twit');
var Pubnub = require('pubnub');
var nconf = require('nconf');
var sentimental = require('Sentimental');

nconf.file({ file: 'config.json' }).env();

var tweet = {};

var twitter = tweet.twitter = new Twit({
    consumer_key: nconf.get('TWITTER_CONSUMER_KEY'),
    consumer_secret: nconf.get('TWITTER_CONSUMER_SECRET'),
    access_token: nconf.get('TWITTER_ACCESS_TOKEN'),
    access_token_secret: nconf.get('TWITTER_TOKEN_SECRET')
});

var pubnub = tweet.pubnub = Pubnub({
    publish_key: nconf.get('PUBNUB_PUBLISH_KEY'),
    subscribe_key: nconf.get('PUBNUB_SUBSCRIBE_KEY')
});

var stream, cachedTweet, publishInterval;

/**
 * Starts Twitter stream and publish interval
 */

var lastPublishedTweetId;
var tweetArray = [];
tweet.start = function () {
    var response = { };
    // If the stream does not exist create it
    if (!stream) {
        // Connect to stream and filter by a geofence that is the size of the Earth
        var earth = {locations: '-180,-90,180,90' };

        stream = twitter.stream('statuses/filter', earth);
        stream.on('tweet', function (tweet) {
            if(tweet.id = lastPublishedTweetId || tweet == null || tweet.place == null){
                return;
            }

            lastPublishedTweetId = tweet.id;
            //console.log(tweet);
            var newTweet = {name: tweet.text,
                country_code: tweet.place.country_code,
                longitude: tweet.place.bounding_box.coordinates[0][0][0],
                latitude: tweet.place.bounding_box.coordinates[0][0][1],
                radius: 12,
                fillKey: 'red',
                user_name: tweet.user.name,
                screen_name: tweet.user.screen_name,
                profile_pic: tweet.user.profile_image_url,
                sentiment: sentimental.analyze(tweet.text).score};
            cachedTweet = newTweet;
            if(tweetArray.length<2){
                tweetArray.push(newTweet);
            }
        });
        response.message = 'Stream created and started.'
    }
    // If the stream exists start it
    else {
        stream.start();
        response.message = 'Stream already exists and started.'
    }

    publishInterval = setInterval(function () {
        if (cachedTweet) {
            publishTweet(tweetArray); // publishes tweet to pubnub
            tweetArray=[];
        }
    }, 100);
    return response;
}

tweet.query = function(query){
    query = query.split(' ').join('+');
    console.log(query);
}
//tweet.twitter.get('trends/available', {}, function(err, data, response) {
    //console.log(data)
//})

function publishTweet (tweet) {
    pubnub.publish({
        post: false,
        channel: 'tweet_stream',
        message: tweet,
        callback: function (details) {
            //console.log(details);
        }
    });
}
module.exports = tweet;