//
// The Alchemy API
//
// So far implemented: sentiment, targeted sentiment, keywords, entities, emotion.
// Warning: emotion is significantly slower that the others.

Alchemy = new function() {
	//
	// Sentiment.
	//

	// Get the sentiment for the given text. See Sentiment class for documentation.
	//
	// sentimentText(text: String, callback: function(data: Sentiment, error: Unknown))
	this.sentimentText = function(text, callback) {
		asText('alc_sentiment', text, callback, toSentiment);
	};

	// Get the sentiment for the given tweet.
	//
	// sentimentTweet(tweet: Tweet, callback: function(data: Sentiment, error: Unknown))
	this.sentimentTweet = function(tweet, callback) {
		asTweet(tweet, callback, this.sentimentText);
	};

	// Get the sentiment for the given array of tweets. It will concatenate all 
	// tweets into a single string and call the api on that string.
	//
	// sentimentTweetsAsArray(tweets: Array[Tweet], callback: function(data: Sentiment, error: Array[Unknown]))
	this.sentimentTweetsAsText = function(tweets, callback) {
		asTweetsAsText(tweets, callback, this.sentimentText);
	};

	// Get the sentiment for the given array of tweets (for each individual
	// tweet separatly).
	//
	// sentimentTweetsAsArray(tweets: Array[Tweet], callback: function(data: Array[Sentiment], error: Array[Unknown]))
	this.sentimentTweetsAsArray = function(tweets, callback) {
		asTweetsAsArray('alc_sentiment_array', tweets, callback, toSentiment);
	};



	//
	// Sentiment targeted. This is sentiment analysis targeted at a specific
	// phrase (word or hashtag).
	//

	// Get the targeted sentiment for the given text. See Sentiment class for 
	// documentation.
	//
	// sentimentTargetedText(text: String, word: String, callback: function(data: Sentiment, error: Unknown))
	this.sentimentTargetedText = function(text, word, callback) {
		asText('alc_sentiment_targeted', { text: text, word: word }, callback, toSentiment);
	};

	// Get the targeted sentiment for the given tweet.
	//
	// sentimentTargetedTweet(tweet: Tweet, word: String, callback: function(data: Sentiment, error: Unknown))
	this.sentimentTargetedTweet = function(tweet, word, callback) {
		if(tweet.hasText())
			this.sentimentTargetedText(tweet.getText(), word, callback);
		else
			callback({}, "Error: Tweet has no text.");
	};

	// Get targeted sentiment for the given tweets. It will concatenate all tweets
	// into a single string and call the api on that string.
	//
	// sentimentTargetedTweetsAsText(tweets: Array[Tweet], callback: function(data: Sentiment, error: Array[Unknown]))
	this.sentimentTargetedTweetsAsText = function(tweets, word, callback) {
		var text = "";
		for(var i = 0; i < tweets.length; ++i)
			if(tweets[i].hasText())
				text += " " + tweets[i].getText();

		if(text === "")
			callback({}, "Error: No text provided.");
		else
			this.sentimentTargetedText(text, word, callback);
	};
	
	// Get the targeted sentiment for the given array of tweets (for each individual
	// tweet separatly).
	//
	// sentimentTargetedTweetsAsArray(tweets: Array[Tweet], word: String, callback: function(data: Array[Sentiment], error: Array[Unknown]))
	this.sentimentTargetedTweetsAsArray = function(tweets, word, callback) {
		// Get an array of texts from the tweets.
		var texts = textify(tweets);

		// Make a request.
		serverConnection(
			'alc_sentiment_targeted_array',
			{ texts: texts, word: word },
			function(data) {
			// Process all sentiments.
			for(var i = 0; i < data.data.length; ++i)
				data.data[i] = toSentiment(data.data[i]);

			callback(data.data, data.error);
			}
		);
	};



	//
	// Keywords.
	//

	// Get the keywords for the given text. See the Keyword class for documentation.
	//
	// keywordText(text: String, callback: function(data: Array[Keyword], error: Unknown))
	this.keywordsText = function(text, callback) {
		asText('alc_keywords', text, callback, toKeyword);
	};

	// Get the keywords for the given tweet. See the Keyword class for documentation.
	//
	// keywordsTweet(tweet: Tweet, callback: function(data: Array[Keyword], error: Unknown))
	this.keywordsTweet = function(tweet, callback) {
		asTweet(tweet, callback, this.keywordsText);
	};

	// Get the keywords for the given tweets. It will concatenate all tweets
	// into a single string and call the api on that string.
	//
	// keywordsTweetsAsText(tweets: Array[Tweet], callback: function(data: Array[Keyword], error: Unknown))
	this.keywordsTweetsAsText = function(tweets, callback) {
		asTweetsAsText(tweets, callback, this.keywordsText);
	};

	// Get the keywords for the given tweets. (for each individual
	// tweet separatly).
	//
	// keywordsTweetsAsArray(tweets: Array[Tweet], callback: function(data: Array[Array[Keyword]], error: Unknown))
	this.keywordsTweetsAsArray = function(tweets, callback) {
		asTweetsAsArray('alc_keywords_array', tweets, callback, toKeyword);
	};



	//
	// Entities.
	//

	// Get the entities for the given text. See the Entity class for documentation.
	//
	// entitiesText(text: String, callback: function(data: Array[Entity], error: Unknown))
	this.entitiesText = function(text, callback) {
		asText('alc_entities', text, callback, toEntity);
	};

	// Get the entities for the given tweet.
	//
	// entitiesTweet(tweet: Tweet, callback: function(data: Array[Entity], error: Unknown))
	this.entitiesTweet = function(tweet, callback) {
		asTweet(tweet, callback, this.entitiesText);
	};

	// Get the entities for the given tweets. It will concatenate all tweets
	// into a single string and call the api on that string.
	//
	// entitiesTweetsAsText(tweets: Array[Tweet], callback: function(data: Array[Entity], error: Unknown))
	this.entitiesTweetsAsText = function(tweets, callback) {
		asTweetsAsText(tweets, callback, this.entitiesText);
	};

	// Get the entities for the given tweets (for each individual
	// tweet separatly).
	//
	// entitiesTweetsAsArray(tweets: Array[Tweet], callback: function(data: Array[Array[Entity]], error: Unknown))
	this.entitiesTweetsAsArray = function(tweets, callback) {
		asTweetsAsArray('alc_entities_array', tweets, callback, toEntity);
	};



	//
	// Emotion.
	// Warning: emotion is significantly slower that the others.
	//

	// Get emotion data for the given text. See the Emotion class for documentation.
	//
	// emotionText(text: String, callback: function(data: Emotion, error: Unknown))
	this.emotionText = function(text, callback) {
		asText('alc_emotion', text, callback, toEmotion);
	};

	// Get the emotion for the given tweet.
	//
	// emotionTweet(tweet: Tweet, callback: function(data: Emotion, error: Unknown))
	this.emotionTweet = function(tweet, callback) {
		asTweet(tweet, callback, this.emotionText);
	};

	// Get the emotion for the given tweets. It will concatenate all tweets
	// into a single string and call the api on that string.
	//
	// emotionTweetsAsText(tweets: Array[Tweet], callback: function(data: Emotion, error: Unknown))
	this.emotionTweetsAsText = function(tweets, callback) {
		asTweetsAsText(tweets, callback, this.emotionText);
	};

	// Get the emotion for the given tweets (for each individual
	// tweet separatly).
	//
	// emotionTweetsAsArray(tweets: Array[Tweet], callback: function(data: Array[Emotion], error: Unknown))
	this.emotionTweetsAsArray = function(tweets, callback) {
		asTweetsAsArray('alc_emotion_array', tweets, callback, toEmotion);
	};


	// This optimised for clustering.
	// getKeywords(query: String, tweets: Array[Tweet], function(data: Array[Keyword], error: Unknown))
	this.getKeywords = function(query, tweets, callback) {
 		var keywords = new Array()
 		var errors = new Array()

 		// First split the query.
 		/*
 		var query_key = query.split(" ");
 		for(var i = 0; i < query_key.length; i++)
 			keywords.push({ text: query_key[i] , relevance: 1.0 })
*/
 		// Get keywords.
 		var callback_keywords = function(keys, error) {
 			errors.push(error);

 			// Filter.
 			for(var i = 0; i < keys.length; i++)
 				if(keys[i].text.length <= 30 && keys[i].relevance > 0.7 && keys[i].text.length > 2)
 					keywords.push(keys[i])

 			// Return the data.
 			callback(keywords, errors);
 		}

 		// Get entities.
 		var callback_entities = function(entities, error) {
 			errors.push(error);

 			// Filter for count > 1.
 			for(var i = 0; i < entities.length; i++)
 				if(entities[i].type === "TwitterHandle" || entities[i].type === "Hashtag") {
 					if(entities[i].count > 2)
 						keywords.push(entities[i])
 				} else {
 					if(entities[i].count > 1 && entities[i].relevance > 0.1)
 						keywords.push(entities[i])
 				}

 			// Call for keywords
 			Alchemy.keywordsTweetsAsText(tweets, callback_keywords);
 		}

 		Alchemy.entitiesTweetsAsText(tweets, callback_entities);
	}




	// 
	// Auxiliary methods.
	//

	// Given an array of tweets, return an array of their respective texts.
	var textify = function(tweets) {
		var texts = new Array();

		for(var i = 0; i < tweets.length; ++i)
			texts[i] = tweets[i].getText();

		return texts;
	};

	// Standard server connection for data request.
	var serverConnection = function(channel, data, callback) {
		// Make a request.
		var connection_id = Socket.getNewConnectionId();
		Socket.emit(channel + "_req", { data: data, connection_id: connection_id });

		// Wait for the response.
		Socket.on(channel + "_res" + connection_id, function(data) { callback(data); });
	};

	// Process as text.
	var asText = function(channel, input, callback, processMethod) {
		serverConnection(
			channel,
			input,
			function(data) {
				callback(processMethod(data.data), data.error);	
			}
		);
	};

	// Process as tweet.
	var asTweet = function(tweet, callback, delegate) {
		if(tweet.hasText())
			delegate(tweet.getText(), callback);
		else
			callback({}, "Error: Tweet has no text.");
	};

	// Process tweets as a text.
	var asTweetsAsText = function(tweets, callback, delegate) {
		var text = "";
		for(var i = 0; i < tweets.length; ++i)
			if(tweets[i].hasText())
				text += ". " + tweets[i].getText();

		if(text === "")
			callback({}, "Error: No text provided.");
		else
			delegate(text, callback);
	};

	// Process tweets as an array.
	var asTweetsAsArray = function(channel, tweets, callback, processMethod) {
		// Get an array of texts from the tweets.
		var texts = textify(tweets);

		// Make a request.
		serverConnection(
			channel,
			texts,
			function(data) {
			// Process all sentiments.
			for(var i = 0; i < data.data.length; ++i)
				data.data[i] = processMethod(data.data[i]);

			callback(data.data, data.error);
			}
		);
	};
};