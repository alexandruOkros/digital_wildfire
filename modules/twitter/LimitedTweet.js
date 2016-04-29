// The LimitedTweet type:
//
// Receive an object of type LimitedTweet, but without methods and extend it
// with the appropriate methods, returning the resulted object.
//
// function toLimitedTweet(tweet: LimitedTweet): LimitedTweet
function toLimitedTweet(tweet) {

	// Extending the object with methods.

	//
	// created_at    (creation date and time).
	//
	// hasCreatedAt(): Boolean
	tweet.hasCreatedAt = function() {
		return (tweet.hasOwnProperty('Timestamp') && tweet.Timestamp !== null
			&& tweet.Timestamp !== "");
	}
	// Convert tweet.Timestamp to a time object.
	// Example: tweet.Timestamp = "23/02/2016 12:50".
	if(tweet.hasCreatedAt()) {
		// Only create a date object if the .Timestamp is set.
		var year = tweet.Timestamp.substr(6, 4);
		var month = tweet.Timestamp.substr(3, 2);
		var day = tweet.Timestamp.substr(0, 2);
		var hours = tweet.Timestamp.substr(11, 2);
		var minutes = tweet.Timestamp.substr(14, 2);
		var seconds = 0;  // Cannot be retrieved.
		var milliseconds = 0;  // Cannot be retrieved - also don't care.

		// Create the date object.
		var created_at_date = new Date(year, month, day, hours, minutes,
			seconds, milliseconds);
		// console.log(year + " " + month + " " + day + " " + hours + " " + 
			// minutes + " " + seconds + " " + milliseconds);
	}
	// getCreatedAt(): Date
	tweet.getCreatedAt = function() {
		return created_at_date;
	}


	//
	// text    (the text of the tweet).
	//
	// hasText(): Boolean
	tweet.hasText = function() {
		return (tweet.hasOwnProperty('Tweet Text') && 
			tweet['Tweet Text'] !== null && tweet['Tweet Text'] !== "");
	}
	// getText(): String
	tweet.getText = function() {
		return tweet['Tweet Text'];
	}


	// 
	// geo
	//
	// hasLocation(): Boolean
	tweet.hasLocation = function() {
		return (tweet.hasOwnProperty('Latitude') && tweet.Latitude !== null &&
			tweet.hasOwnProperty('Longitude') && tweet.Longitude !== null &&
			tweet.Latitude !== 0 && tweet.Longitude !== 0);
	}
	// getLocation(): Array[Float]  (array with 2 elements).
	tweet.getLocation = function() {
		return [tweet.Longitude, tweet.Latitude];
	}


	//
	// language    (language of tweet).
	//
	// hasLanguage(): Boolean
	tweet.hasLanguage = function() {
		return (tweet.hasOwnProperty('Language') &&
			tweet.Language !== null && tweet.Language !== "");
	}
	// Values like: "EN", "JA" ...
	// getLanguage(): String
	tweet.getLanguage = function() {
		return tweet.Language;
	}


	// 
	// user
	//
	tweet.user = {};
	//
	// screen_name    (screen name of user i.e. @username).
	//
	// hasScreenName(): Boolean
	tweet.user.hasScreenName = function() {
		return (tweet.hasOwnProperty('Account') && tweet.Account !== null
			&& tweet.Account !== "");
	}
	// getScreenName(): String
	tweet.user.getScreenName = function() {
		return tweet.Account;
	}
	//
	// gender    (gender of user).
	//
	// hasGender(): Boolean
	tweet.user.hasGender = function() {
		return (tweet.hasOwnProperty('Gender') && tweet.Gender !== null
			&& tweet.Gender !== "");
	}
	// Values: "UNKNOWN", "MALE", "FEMALE", "UNISEX". 
	// getGender(): String
	tweet.user.getGender = function() {
		return tweet.Gender;
	}


	return tweet;
}
