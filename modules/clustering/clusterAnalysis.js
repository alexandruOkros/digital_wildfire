//var PriorityQueue = require('./priority-queue.js');

//returns an array with 'number' most occurring strings from array 'a'
//if there are less than 'number' strings, the remaining entries in the returned array are all the empty string
function modeCalc(a, number) {
 
	function clusterCount(entity, count) {
		this.ent = entity;
		this.val = count;
	}
	compareCount = function( entity1, entity2)  {
    var ans = 0;
    if (entity1 != undefined && entity2 != undefined)
		  ans = (entity2.val - entity1.val);
    return ans;
	}
	var maxOrder = new PriorityQueue({comparator : compareCount});

    
  var counter = {};    
  for (var i in a) {
    if (!(a[i] in counter)) {
        counter[a[i]] = 0;
       // console.log(a[i] + " put in counter");
    }
    counter[a[i]]++;
 	}
 	var done = {};
 	for (var i in a) {
 		if (!(a[i] in done)) {
      var k = new clusterCount(a[i],counter[a[i]]);
      //console.log(" " + k.val);
 			maxOrder.queue(k);
 			done[a[i]] = 1;
      //console.log(a[i] + " done")
 		}
 	}
 	var ans = [];
 	for (i =0 ; i < number; i++ ) {
    ans[i] = "";
    try {
 	    var answer = maxOrder.dequeue();
      ans[i]= answer.ent;
    }
    catch(err) {}
 	}   
  return ans;  

}
//TODO: check it works^^


//cluster is an array of tweets
//clusters is an array of clusters



  //var popular = []

// TODO: find a better way to calculate location?
// returns mean location of the cluster
/* function locationCluster(cluster) {
	var sum = [0,0];
	var hasloc= 0;
	for (i = 0; i < cluster.length; i++) {
		if (cluster[i].hasLocation()) {
			hasloc = hasloc + 1;
			sum[0] = sum[0] + cluster[i].getLocation[0];
			sum[1] = sum[1] + cluster[i].getLocation[1];
		}
	}
	var avg = [sum[0]/hasloc, sum[1]/hasloc];
	return avg;
}
*/
// returns mean number of retweets of the cluster
/*function popularityCluster(cluster) {
	var retweetcount= 0;
	for (i = 0; i< cluster.length; i++) {
		if (cluster.tweets[i].hasRetweetCount()) {
			retweetcount = retweetcount + cluster.tweets[i].getRetweetCount();
		}
	}
	var avg = retweetcount/(cluster.length);
	console.log("POPU " + avg);
}
// adds methods to each cluster using methods above */




//the get info method calls alchemy api. currently gives entities, 
//relevant tweets and overall sentiment
function toClusterObject(cluster, callback) {

	cluster.getInfo = function() {
		 
	    function callbackRelevant(entities, error) {

	      var concatEntities = [];
	      for (i = 0; i < entities.length; i++) {
	        for ( j = 0; j < entities[i].length; j++){
	          var ent = entities[i][j].text;
	          concatEntities.push(ent);
	        }
	      }
	      //popular is the list of 3 most popular entities
	      popular = modeCalc(concatEntities,3);
	        
	      console.log(popular);
	      // Make this result visible.
	      cluster.popular_entities = popular;

	      //rel is all the tweets which contain all the entities from popular
	      var rel = [];
	      for (i = 0; i < entities.length; i++) {
	        var allEnt = [];
	        for ( j = 0; j < entities[i].length; j++){
	          var ent = entities[i][j].text;
	          allEnt.push(ent);
	        }
	        if((allEnt.indexOf(popular[0]) != -1) && (allEnt.indexOf(popular[1]) != -1) && (allEnt.indexOf(popular[2]) != -1)) {
	          console.log(cluster.tweets[i].text);
	          rel.push(cluster.tweets[i]);
	        }
	      }
	      var sent = 0;
	      function callbackSenti(sentiment, error){
	        for (i = 0; i < sentiment.length; i++) {
	          if (sentiment[i] !== null && sentiment[i].hasOwnProperty('score')) {
	            sent = sent + sentiment[i].score;
	          }
	        }
	        //avg is the avg sentiment of all the tweets
	        var avg = sent/(sentiment.length);
	        console.log(avg);
	        // Make result visible.
	        cluster.average_sentiment = avg;

	        // I'm done with this cluster. Signal. Think of conccurrent 
	        // programming synchronisation.
	        callback();
	      }

	      Alchemy.tweetsAsArray('sentiment', cluster.tweets,callbackSenti);
	    }


    Alchemy.tweetsAsArray('entities', cluster.tweets,callbackRelevant);

  }

  return cluster;
}
// takes an array of clusters and converts each cluster into a clusterObject
function clusterAnalysis(clusters, onCompletion) {
	var clusterObjects = [];
  	console.log("CLUSTERANALYSIS");

  	// Return result when all clusters have been computed.
  	var count = clusters.length;
  	var callback = function() {
  		count -= 1;
  		if(count === 0)  // We are finished.
  			onCompletion(clusterObjects);
  	}
	
	for (i = 0 ; i < clusters.length; i++) {
	    // console.log(i);
	    var co = new toClusterObject(clusters[i], callback);

	    co.getInfo();
		clusterObjects.push(co); 
	}
	//Show(clusterObjects); ??
}

Analysis = new function() {
	function removeUrls(tweets) {
		var protomatch = /(https?|ftp):\/\/[\.[a-zA-Z0-9\/\-]+/; // NB: not '.*'
 		for(var i = 0; i < tweets.length; i++) {
 			tweets[i].backup_text = tweets[i].text
			tweets[i].text = tweets[i].getText().replace(protomatch, '')
			// console.log(tweets[i].getText())
		}
	}

	function addUrlsBack(tweets) {
		for(var i = 0; i < tweets.length; i++) {
 			tweets[i].text = tweets[i].backup_text
			// console.log(tweets[i].getText())
		}
	}

	this.analyzeCluster = function(cluster, onCompletion) {
		// Number of questions.

		var metrics = []

		// Run all standard metrics.
		for(var i = 0; i < cluster.tweets.length; i++) {
			metrics[i] = {}
			var tweet = cluster.tweets[i]

			// Question.
			if(tweet.getText().indexOf('?') !== -1)
				metrics[i].question = 0.9
			else 
				metrics[i].question = 1.0

			// Lengh of tweet.
			if(tweet.getText().length > 69)
				metrics[i].long = 1.0
			else
				metrics[i].long = 0.95

			if(tweet.user.isVerified())
				metrics[i].user_verified = 1.0
			else
				metrics[i].user_verified = 0.5

			var followers = tweet.user.getFollowersCount()
			if(followers > 10000)
				metrics[i].user_popular = 1.0
			else if(followers > 1000)
				metrics[i].user_popular = 0.5
			else
				metrics[i].user_popular = 0.25

			metrics[i].score = 
				metrics[i].question * 
				metrics[i].long * 
				metrics[i].user_verified * 
				metrics[i].user_popular
		}

		var analysis = { metrics: metrics }

		// Remove urls.
		removeUrls(cluster.tweets)

		// Analyze sentiments.
		var callback = function(sentiments, error) {
			var negative = 0
			var positive = 0

 			for(var i = 0; i < cluster.tweets.length; i++) {
 				// Save metric.
 				metrics[i].sentiment = sentiments[i]

 				if(sentiments[i] !== null) {
 					if(sentiments[i].type === 'positive')
 						positive += 1 //metrics[i].score
 					else if(sentiments[i].type === 'negative')
 						negative += 1 //metrics[i].score
 				}
 			}

			analysis.positive = positive
			analysis.negative = negative
			analysis.likelihood = 100.0 * positive / (positive + negative)
			onCompletion(analysis)
		}

		/*
		var callback = function(keywords, error) {
			onCompletion({ questions: count, keywords: keywords })

		}

		Alchemy.tweetsAsText('keywords', cluster.tweets, callback)
		*/
		Alchemy.tweetsAsArray('sentiment', cluster.tweets, callback)
	}
}
