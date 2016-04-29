// The Trend type:
//
// Receive an object of type Trend, but without methods and extend it with the
// appropriate methods, returning the resulted object.
//
// function toTrend(trend: Trend): Trend
function toTrend(trend) {

	// Extending the object with methods.

	//
	// name    (trending topic).
	//
	// hasName(): Boolean
	trend.hasName = function() {
		return (trend.hasOwnProperty('name') && trend.name !== null && 
			trend.name !== "");
	}
	// getName(): String
	trend.getName = function() {
		return trend.name;
	}


	// 
	// promoted_content
	//
	// isPromotedContent(): Boolean
	trend.isPromotedContent = function() {
		return (trend.hasOwnProperty('promoted_content') &&
			trend.promoted_content !== null && trend.promoted_content);
	}


	//
	// tweet_volume     (for the last 24 hours)
	//
	// hasTweetVolume(): Boolean
	trend.hasTweetVolume = function() {
		return (trend.hasOwnProperty('tweet_volume') &&
			trend.tweet_volume !== null);
	}
	// Return 0 if field is not set.
	// getTweetVolume(): String
	trend.getTweetVolume = function() {
		if(trend.hasTweetVolume())
			return trend.tweet_volume;
		else
			return 0;
	}


	return trend;
}
