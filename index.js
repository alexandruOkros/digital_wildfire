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


	//
	// Alchemy API.
	//
	// Sentiment Analysis.
	clientConnection('alc_sentiment', Alchemy.sentimentText);
	// Vectorised Sentiment Analysis.
	clientConnection('alc_sentiment_array', Alchemy.sentimentArray);
	
	// Targeted Sentiment Analysis.
	clientConnection('alc_sentiment_targeted', Alchemy.sentimentTargetedText);
	// Vectorised Targeted Sentiment Analysis.
	clientConnection('alc_sentiment_targeted_array', Alchemy.sentimentTargetedArray);
	
	// Keywords.
	clientConnection('alc_keywords', Alchemy.keywordsText);
	// Vectorise Keywords.
	clientConnection('alc_keywords_array', Alchemy.keywordsArray);

	// Entities.
	clientConnection('alc_entities', Alchemy.entitiesText);
	// Vectorise Entities.
	clientConnection('alc_entities_array', Alchemy.entitiesArray);
	
	// Emotion.
	clientConnection('alc_emotion', Alchemy.emotionText);
	// Vectorised Emotion.
	clientConnection('alc_emotion_array', Alchemy.emotionArray);
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
};

// Alchemy interface.
Alchemy = new function() {
	// Our key.
	var key = "97a5ce54ae469563c4267cd097ad1d3965118c26";

	// Constants.
	var return_limit = 1000;  // i.e. return maximum no entities.

	// Client.
	var alchemy = new AlchemyAPI(key);

	var classic_text_callback = function(source, callback) {
		return function(err, response) {
			if(response.status === "ERROR")
				callback({ data: {}, error: response.statusInfo });
			else if(err || !response.hasOwnProperty(source))
				callback({ data: {}, error: "AlchemyAPI library error." });
			else
				callback({ data: response[source], error: err });
		};
	};

	var classic_array_callback = function(texts, onCompletion, delegate) {
		var results = new Array();
		var errors = new Array();
	    var count = texts.length;

	    // Add index.
	    for(var i = 0; i < texts.length; ++i)
	    	texts[i] = { id: i, text: texts[i] };

	    async.forEach(texts, function(item, callback1) {
	    	var callback = function(data) {
	    		count -= 1;
	    		results[item.id] = data.data;
	    		errors[item.id] = data.error;

	    		// Check for termination.
	    		if(count === 0)
	    			onCompletion({ data: results, error: errors });
	    	};

	    	delegate(item.text, callback);
	    });
	};

	// Get sentiment analysis on given text.
	this.sentimentText = function(text, callback) {
		alchemy.sentiment(text, {}, classic_text_callback('docSentiment', callback));
	};

	// Get sentiment analysis on given array of texts.
	this.sentimentArray = function(texts, callback) {
		classic_array_callback(texts, callback, Alchemy.sentimentText);
	};

	// Get sentiment analysis on given text.
	this.sentimentTargetedText = function(data, callback) {
		alchemy.sentiment_targeted(data.text, data.word, {}, classic_text_callback('docSentiment', callback));
	};

	// Get sentiment analysis on given array of texts.
	this.sentimentTargetedArray = function(data, onCompletion) {
		var sentiments = new Array();
		var errors = new Array();
		var texts = data.texts;
		var word = data.word;
	    var count = texts.length;

	    // Add index.
	    for(var i = 0; i < texts.length; ++i)
	    	texts[i] = { id: i, text: texts[i] };

	    async.forEach(texts, function(item, callback) {
	    	var callback = function(data) {
	    		count -= 1;
	    		sentiments[item.id] = data.data;
	    		errors[item.id] = data.error;

	    		// Check for termination.
	    		if(count === 0)
	    			onCompletion({ data: sentiments, error: errors });
	    	};

	    	Alchemy.sentimentTargetedText({ text: item.text, word: word }, callback);
	    });
	};

	// Get the keywords of the given text.
	this.keywordsText = function(text, callback) {
		alchemy.keywords(text, { maxRetrieve: return_limit }, classic_text_callback('keywords', callback));
	}

	// Get keywords on given array of texts.
	this.keywordsArray = function(texts, callback) {
		classic_array_callback(texts, callback, Alchemy.keywordsText);
	};

	// Get the entities of the given text.
	this.entitiesText = function(text, callback) {
		alchemy.entities(text, { maxRetrieve: return_limit }, classic_text_callback('entities', callback));
	};

	// Get entities on given array of texts.
	this.entitiesArray = function(texts, callback) {
		classic_array_callback(texts, callback, Alchemy.entitiesText);
	};


	// Get the emotion data of the given text.
	this.emotionText = function(text, callback) {
		alchemy._doRequest(alchemy._getQuery(text, {}, "GetEmotion"), classic_text_callback('docEmotions', callback));
	};

	// Get emotion on given array of texts.
	this.emotionArray = function(texts, callback) {
		classic_array_callback(texts, callback, Alchemy.emotionText);
	};
};