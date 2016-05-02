//
// The Alchemy API
//
// So far implemented: sentiment, targeted sentiment, keywords, entities, emotion.
// Warning: emotion is significantly slower that the others.

Alchemy = new function() {
	// sentiment
	// keywords
	// entities
	// emotion
	// targetedSentiment (not working).

	// Example:
	// Alchemy.text('sentiment', text: String, callback: function(data: Sentiment, error: Unknown))
	// Alchemy.tweet('sentiment', tweet: Tweet, callback: function(data: Sentiment, error: Unknown))
	// Alchemy.tweetsAsText('sentiment', tweets: Array[Tweet], callback: function(data: Sentiment, error: Unknown))
	// Alchemy.tweetsAsArray('sentiment', tweets: Array[Tweet], callback: function(data: Sentiment, error: Array[Unknown]))
	


	// Given an array of tweets, concatenate all of them.
	var tweetsToText = function(tweets) {
		var text = "";

		for(var i = 0; i < tweets.length; ++i)
			if(tweets[i].hasText())
				text += ". " + tweets[i].getText()

		return text
	}

	// Standard server connection for data request.
	var serverConnection = function(channel, data, callback) {
		// Make a request.
		var connection_id = Socket.getNewConnectionId();
		Socket.emit(channel + "_req", { data: data, connection_id: connection_id });

		// Wait for the response.
		Socket.on(channel + "_res" + connection_id, function(data) { callback(data); });
	}

	// Channels of communication.
	var processMethod = {
		'sentiment': 'toSentiment',
		'keywords': 'toKeyword',
		'entities': 'toEntity',
		'targetedSentiment': 'toSentiment',
		'emotion': 'toEmotion'
	}

	// Process data as text.
	var textPrivate = function(channel, branch, text, callback) {
		// Get the processing method.
		if(processMethod.hasOwnProperty(branch))
			var convert = window[processMethod[branch]]
		else
			var convert = function(obj) { return obj; }  // Do nothing.

		serverConnection(
			channel,
			{ text: text, branch: branch },
			function(data) {
				// Properly convert the response and return.
				callback(convert(data.data), data.error);	
			}
		)
	}

	this.text = function(branch, text, callback) {
		textPrivate("alchemy_text", branch, text, callback)
	}

	// Process data as tweet.
	this.tweet = function(branch, tw, callback) {
		if(tw.hasText())
			textPrivate('alchemy_tweet', branch, tw, callback);
		else
			callback({}, "Error: Tweet has no text.");
	}

	// Process tweets as a text.
	this.tweetsAsText = function(branch, tweets, callback) {
		// Convert tweets to text.
		var text = tweetsToText(tweets)

		if(text === "")
			callback({}, "Error: No text provided.");
		else
			Alchemy.text(branch, text, callback)
	}

	// Process tweets as an array.
	this.tweetsAsArray = function(branch, tweets, callback) {
		// Get the processing method.
		if(processMethod.hasOwnProperty(branch))
			var convert = window[processMethod[branch]]
		else
			var convert = function(obj) { return obj; }  // Do nothing.

		// Make a request.
		serverConnection(
			'alchemy_tweets',
			{ tweets: tweets, branch: branch },
			function(data) {
				// Process all tweets.
				for(var i = 0; i < data.data.length; i++)
					data.data[i] = convert(data.data[i]);

				callback(data.data, data.error);
			}
		)
	}

	// This optimised for clustering.
	// getKeywords(query: String, tweets: Array[Tweet], function(data: Array[Keyword], error: Unknown))
	this.getKeywords = function(query, tweets, callback) {
 		var keywords = new Array()
 		var errors = new Array()

 		// First split the query.
 		var query_key = query.split(" ");
 		for(var i = 0; i < query_key.length; i++)
 			if(query_key[i] !== "-RT" && query_key[i] !== "")
 				keywords.push({ text: query_key[i] , relevance: 1.0 })

 		// Get keywords.
 		var callback_keywords = function(keys, error) {
 			errors.push(error);

 			// Filter.
 			for(var i = 0; i < keys.length; i++)
 				if(keys[i].text.length <= 30 && keys[i].relevance > 0.7 && keys[i].text.length > 2) {
 					// Check that it is not included already.
 					var mark = true
 					for(j = 0; j < i && j < 10; j++)
 						if(keys[j].text.toLowerCase() === keys[i].text.toLowerCase()) {
 							mark = false
 							break
 						}

 					if(mark === true)  keywords.push(keys[i])
 				}
 					  
 			// Return the data.
 			callback(keywords, errors);
 		}

 		// Get entities.
 		var callback_entities = function(entities, error) {
 			errors.push(error);

 			// Filter for count > 1.
 			for(var i = 0; i < entities.length; i++)
 				if(entities[i].type === "TwitterHandle" || entities[i].type === "Hashtag") {
 					if(entities[i].count > 4)
 						keywords.push(entities[i])
 				} else {
 					if(entities[i].count > 1 && entities[i].relevance > 0.1)
 						keywords.push(entities[i])
 				}

 			// Call for keywords
 			Alchemy.tweetsAsText('keywords', tweets, callback_keywords);
 		}

 		Alchemy.tweetsAsText('entities', tweets, callback_entities);
	}
}
