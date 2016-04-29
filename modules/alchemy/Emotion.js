// 
// Emotion type.
// Documentation.
//

// class Emotion {
// 		var anger: Float = ... 
// 		var disgust: Float = ...
// 		var fear: Float = ...
// 		var joy: Float = ...
// 		var sadness: Float = ...
// }


// Convert a emotion to a proper Emotion object.
//
// function toEmotion(emotion: Emotion): Emotion
function toEmotion(emotion) {
	// Transform the anger from String to Float.
	if(emotion.hasOwnProperty('anger'))
		emotion.anger = parseFloat(emotion.anger);
	else
		emotion.anger = 0;

	// Transform the disgust from String to Float.
	if(emotion.hasOwnProperty('disgust'))
		emotion.disgust = parseFloat(emotion.disgust);
	else
		emotion.disgust = 0;

	// Transform the fear from String to Float.
	if(emotion.hasOwnProperty('fear'))
		emotion.fear = parseFloat(emotion.fear);
	else
		emotion.fear = 0;

	// Transform the joy from String to Float.
	if(emotion.hasOwnProperty('joy'))
		emotion.joy = parseFloat(emotion.joy);
	else
		emotion.joy = 0;
	
	// Transform the sadness from String to Float.
	if(emotion.hasOwnProperty('sadness'))
		emotion.sadness = parseFloat(emotion.sadness);
	else
		emotion.sadness = 0;

	return emotion;
}