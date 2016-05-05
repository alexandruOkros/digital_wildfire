
var key = "97a5ce54ae469563c4267cd097ad1d3965118c26";

var AlchemyAPI = require('alchemy-api');
var alchemy = new AlchemyAPI(key);

var myText = "#fun, Whoa, AlchemyAPI's Node.js SDK is really great, I can't wait to build my app!";
var myText2 = "Hi, my name is Michael. Elena is my daugther. The goat is in the kitchen."
var myText3 = "Mood. #cat #love #morning @ London, United Kingdom https://t.co/6v4KfE50ll";

var t1 = "Australian says he created bitcoin, but some sceptical: Australian tech entrepreneur Craig Wright identified ... "
// -0.5
var t2 = 'Chris Wright created bitcoin'
// 0.2
var t3 = 'Australian Craig Wright Says He Created Bitcoin '
// neutral
var t4 = 'Top story: How Craig Wright Privately ‘Proved’ He Created Bitcoin | WIRED see more'
// 0.3
var t5 = 'Google Considered $1 Billion Acquisition Of Encrypted Messaging App Telegram'
// neutral
var t6 = 'No, Google did not try to buy us, says Telegram founder '
// -0.51
var t7 = '#Google CEO reportedly met w/ #Telegram founder Durov to discuss $1bn acquisition 2 messengers not enough? #privacy'
// -0.63
var t8 = 'earthquake nepal happened. \
    earthquake nepal did not happen. \
    earthquake nepal. \
    no earthquake in nepal. \
    no earthquake in nepal. \
    no earthquake in nepal. \
    no earthquake in nepal. \
    no earthquake in nepal. no. \
    earthquake nepal. \
    there is no earthquake in nepal. \
    '
var t9 = 'Ted cruz dropout'

alchemy.apiKeyInfo({}, function(err, response) {
  if (err) throw err;

  // Do something with data
  console.log('Status:', response.status, 'Consumed:', response.consumedDailyTransactions, 'Limit:', response.dailyTransactionLimit);
  
});

// Sentiment of text.
/*
alchemy.sentiment(t9, {}, function(err, response) {
  if (err) throw err;

  // See http://www.alchemyapi.com/api/sentiment/htmlc.html for format of returned object
  var sentiment = response.docSentiment;
  console.log(response);

  // Do something with data
});

*/

/*

// Emotion.
alchemy._doRequest(alchemy._getQuery(myText3, {}, "GetEmotion"),  function(err, response) {
  if (err) throw err;

  // See http://www.alchemyapi.com/api/combined-call/ for format of returned object.
  // Each feature response will be available as a separate property.
  console.log(response);
  var feature_response = response.FEATURE_NAME; 


  // Do something with data
});

// Keywords. Important.
alchemy.keywords(myText, {}, function(err, response) {
  if (err) throw err;

  // See http://www.alchemyapi.com/api/keyword/htmlc.html for format of returned object
  var keywords = response.keywords;
  console.log(response);

  // Do something with data
});

// Relation extrancatuon. Subject - action - object. maybe?
alchemy.relations(myText2, {}, function(err, response) {
  if (err) throw err;

  // See http://www.alchemyapi.com/api/relation/htmlc.html for format of returned object
  var relations = response.relations;
  console.log(response.relations[1].subject);
  console.log(response.relations[1].action);
  console.log(response.relations[1].object);

  // Do something with data
});


// Entity extraction.
alchemy.entities(myText, {}, function(err, response) {
  if (err) throw err;

  // See http://www.alchemyapi.com/api/entity/htmlc.html for format of returned object
  var entities = response.entities;
  console.log(response);

  // Do something with data
});


// Sentiment of text.
alchemyapi.sentiment(myText, {}, function(err, response) {
	if (err) throw err;
	
	console.log(response);

	console.log("Sentiment: " + response["docSentiment"]["type"]);
	console.log();
});


// Sentiment targeted. At hashtag for example.
alchemy.sentiment_targeted(myText, 'fun', {}, function(err, response) {
  if (err) throw err;

  // See http://www.alchemyapi.com/api/sentiment/htmlc.html for format of returned object
  var sentiment = response.docSentiment;
  console.log(response);

  // Do something with data
});

alchemy.apiKeyInfo({}, function(err, response) {
  if (err) throw err;

  // Do something with data
  console.log('Status:', response.status, 'Consumed:', response.consumedDailyTransactions, 'Limit:', response.dailyTransactionLimit);
  
});

*/