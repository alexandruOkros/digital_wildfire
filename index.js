//
// Import.
//
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var async = require('async');
var fs = require('fs');
// APIs.
var TwitterAPI = require('twitter');
var AlchemyAPI = require('alchemy-api');


//
// Redirect file requests.
//
app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.use("/style", express.static(__dirname + '/style'));
app.use("/bootstrap", express.static(__dirname + '/bootstrap'));
app.use("/modules", express.static(__dirname + '/modules'));
// TODO. remove
app.use("/simple.html", express.static(__dirname + '/simple.html'));


//
// Sockets.
//
io.on('connection', function(socket) {
	// Create a listening channel with the client side.
	var clientConnection = function(channel, call) {
		socket.on(channel + "_req", function(data) {
			var input = data.data;
			var connection_id = data.connection_id;

			var callback = function(output) {
				// if(channel === 'search')
					// fs.writeFile("./data/tmp", JSON.stringify(output));

				io.emit(channel + "_res" + connection_id, output);
			}

			call(input, callback);
		});
	}


	//
	// Twitter.
	//
	// Search page request.
	clientConnection('search', Twitter.searchTweets);
	// Trends page request.
	clientConnection('trend', Twitter.getTrends);
	// Archive request.
	clientConnection('archive', Twitter.searchArchive);
	// Demo.
	clientConnection('demo', Twitter.demo);


	//
	// Alchemy API.
	//
	// Text analysis.
	clientConnection('alchemy_text', Alchemy.textAnalysis);

	// Tweet analysis.
	clientConnection('alchemy_tweet', Alchemy.tweetAnalysis);

	// Tweets (as array).
	clientConnection('alchemy_tweets', Alchemy.tweetsAnalysis);

});


//
// The server.
//
// The port to listen to.
var port = Number(process.env.PORT || 3000); 

// Listen.
http.listen(port, function(){
	console.log('listening on http:\\\\localhost:' + port);
});


//
// Libraries.
//

// Twitter interface.
Twitter = new function() {
	// A client connected to the Twitter API.
	var client = null;

	// Create a client if there is none.
	var connect = function() {
		if(client === null)
			client = new TwitterAPI({
				consumer_key: 'RmJ3oLFcxmbUnXnWr0hK4HduL',
				consumer_secret: 'dxq6EZSYYIi16bRxQe3xykUwdIjr7xTunl1sZHmGAycQmizwPT',
				access_token_key: '4919214645-KfdrJKSdzNk2CKJRnW5hjuzVXPf8wCiPWTtZqSL',
				access_token_secret: 'GthrWFZROFDsf4WfSObrVRUQW01urjZxircf4PfgL6ZzU'
			});
	}

	var getMaxIdFromString = function(string) {
		var index = string.indexOf("max_id=");
		if(index !== -1) {
			index += 7;
			var index2 = string.indexOf("&", index);
			var max_id = string.substr(index, index2 - index);
			return max_id;
		}
		return -1;  // Failed.
	}

	// Search Tweets.
	this.searchTweets = function(input, callback) {
		connect();

		var pages = input.params.pages;

		// Make the API call.
		client.get('search/tweets',
			input.query, 
			function(error, data, response) {
				if(pages === 1 || data.statuses.length === 0)
					callback({ error: error, data: data, response: response });
				else {
					var max_id = data.statuses[data.statuses.length - 1].id;
					console.log(max_id);

					var callback2 = function(received) {
						// Check for duplicates.
						if(received.data.statuses.length > 0 && received.data.statuses[0].id === max_id)
							received.data.statuses.shift();

						callback({ error: error, data: { statuses: data.statuses.concat(received.data.statuses) }, response: response })
					}

					input.params.pages = pages - 1;
					input.query.max_id = max_id;
					Twitter.searchTweets(input, callback2);
				}
			}
		);
	};

	// Get trending stuff for give location.
	this.getTrends = function(location, callback) {
		connect();

		// Make the API call.
		client.get(
			'trends/place', 
			{ id: location },
			function(error, data, response) {
				callback({error: error, data: data, response: response });
			}
		);
	}

	// Search the archieve.
	this.searchArchive = function(data, callback) {
		results = JSON.parse(fs.readFileSync('./data/imported_data_' + data.which, 'utf8'));
		callback({ error: "", data: results, response: "ok" });
	}

	// Get demo data.
	this.demo = function(data, callback) {
		if(data.query.q === "google telegram") {
			results = JSON.parse(fs.readFileSync('./data/google_telegram', 'utf8'));
			callback(results);
		} else  // Return nothing.
			callback({ error: "no demo data", data: {}, response: "" });
	}
}

// Alchemy interface.
Alchemy = new function() {
	// Our key.
	var key = "97a5ce54ae469563c4267cd097ad1d3965118c26";

	// Constants.
	var return_limit = 1000;  // i.e. return maximum no entities.

	// Client.
	var alchemy = new AlchemyAPI(key);

	// Standard responses.
	var error = function(string) {
		return { data: {}, error: string }
	}

	var classic_text_callback = function(source, callback) {
		return function(err, response) {
			if(response === null)
				callback({ data: {}, error: "No response." });
			else if(response.status === "ERROR")
				callback({ data: {}, error: response.statusInfo });
			else if(err || !response.hasOwnProperty(source))
				callback({ data: {}, error: "AlchemyAPI library error." });
			else
				callback({ data: response[source], error: err });
		};
	}

	var classic_array_callback = function(branch, tweets, onCompletion) {
		var results = new Array();
		var errors = new Array();
	    var count = tweets.length;

	    // Add index.
	    for(var i = 0; i < tweets.length; ++i)
	    	tweets[i] = { id: i, tweet: tweets[i] }

	    async.forEach(tweets, function(item, callback1) {
	    	// One item was processed.
	    	var callback = function(data) {
	    		count -= 1;
	    		results[item.id] = data.data;
	    		errors[item.id] = data.error;

	    		// Check for termination.
	    		if(count === 0)
	    			onCompletion({ data: results, error: errors })
	    	}

	    	Alchemy.tweetAnalysis({ text: item.tweet, branch: branch }, callback)
	    })
	}

	this.textAnalysis = function(data, callback) {
		// Unpack the data.
		var text = data.text
		var branch = data.branch

		if(branch === 'sentiment')  // Sentiment.
			alchemy.sentiment(text, {}, 
				classic_text_callback('docSentiment', callback));
		else if(branch === 'keywords')  // Keywords.
			alchemy.keywords(text, { maxRetrieve: return_limit }, 
				classic_text_callback('keywords', callback));
		else if(branch === 'entities')  // Entities.
			alchemy.entities(text, { maxRetrieve: return_limit }, 
				classic_text_callback('entities', callback));
		else if(branch === 'targetedSentiment')  // Targeted sentiment.
			alchemy.sentiment_targeted(text.text, text.word, {}, 
				classic_text_callback('docSentiment', callback));
		else if(branch === 'emotion')  // Emotion.
			alchemy._doRequest(alchemy._getQuery(text, {}, "GetEmotion"), 
				classic_text_callback('docEmotions', callback));
		else  // Illegal branch parameter.
			callback(error("Branch not found."));
	}

	this.tweetAnalysis = function(data, callback) {
		// Unpack the data.
		var tweet = data.text
		var branch = data.branch

		var cached_data = Cache.get(branch, tweet)

		if(cached_data !== null)
			callback(cached_data)
		else {
			var callback2 = function(data) {
				// Save the data before returning.
				Cache.store(branch, tweet, data)
				callback(data)
			}

			// Come back here to save the data.
			Alchemy.textAnalysis({ text: tweet.text, branch: branch }, callback2)
		}
	}

	this.tweetsAnalysis = function(data, callback) {
		// Unpack the data.
		var tweets = data.tweets
		var branch = data.branch

		classic_array_callback(branch, tweets, callback);
	}
}

//
// Cache Alchemy API calls.
//
Cache = new function() {
	var branches = [
		'sentiment',
		'keywords',
		'entities',
		'targetedSentiment',
		'emotion'
	]

	// Stored data.
	var data = {}
	var modified = {}

	var update = function() {
		// Check what to save.
		for(var i = 0; i < branches.length; i++) {
			if(modified[branches[i]] === true) {
				fs.writeFile('./cache/' + branches[i], JSON.stringify(data[branches[i]]));
				modified[branches[i]] = false
				console.log("Writen " + branches[i]);
			}
		}

		setTimeout(function() { update() }, 5 * 1000)  // Every minute.
	}

	var initialise = function() {
		// Read all the data.
		for(var i = 0; i < branches.length; i++) {
			data[branches[i]] = JSON.parse(fs.readFileSync(
				'./cache/' + branches[i], 'utf8'));
			modified[branches[i]] = false
		}

		console.log("!!! Read the cache.")
		// Start the update process.
		update();
	}

	this.get = function(branch, tweet) {
		if(tweet.hasOwnProperty('id') && data[branch].hasOwnProperty(tweet.id))
			return data[branch][tweet.id]

		return null
	}

	this.store = function(branch, tweet, value) {
		if(tweet.hasOwnProperty('id')) {
			data[branch][tweet.id] = value
			modified[branch] = true
		}
	}

	// Run the system.
	initialise()
}