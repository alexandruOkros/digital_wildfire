// 
// Sentiment type.
// Documentation.
//

// Warning: The API might not return sentiment data. You should check for
// equality with null.
//
// class Sentiment {
// 		var type: String = 'negative' | 'neutral' | 'positive';
//		var mixed: Boolean = true if it's both negative and positive.
// 		var score: Float = values from -1 to 1; not given for neutral type.
// }


// Convert a sentiment to a proper Sentiment object.
//
// function toTrend(sentiment: Sentiment): Sentiment
function toSentiment(sentiment) {
	// Check if data exists.
	if(!sentiment.hasOwnProperty('type'))
		return null;

	// Transform the score from String to Float.
	if(sentiment.hasOwnProperty('score'))
		sentiment.score = parseFloat(sentiment.score);
	else
		sentiment.score = 0;

	// See if it's mixed sentiment.
	if(sentiment.hasOwnProperty('mixed') && sentiment.mixed == 1)  // TODO: Is this check right?
		sentiment.mixed = true;

	return sentiment;
}