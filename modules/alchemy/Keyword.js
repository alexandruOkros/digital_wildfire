// 
// Keyword type.
// Documentation.
//

// class Keyword {
// 		var text: String = the keyword.
// 		var relevance: Float = ...
// }


// Convert a keyword to a proper Keyword object.
//
// function toKeyword(keyword: Keyword): Keyword
function toKeyword(keyword) {
	// Transform the relevance from String to Float.
	if(keyword.hasOwnProperty('relevance'))
		keyword.relevance = parseFloat(keyword.relevance);
	else
		keyword.relevance = 0;

	return keyword;
}