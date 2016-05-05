//var PriorityQueue = require('./priority-queue.js');
/*
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



/*
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

*/





Analysis = new function() {
	function removeUrl(text) {
		var protomatch = /(https?|ftp):\/\/[\.[a-zA-Z0-9\/\-]+/; // NB: not '.*'
 		return text.replace(protomatch, '')
	}

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

	this.mostRelevantImage = function(cluster) {
		// Find the most relevant picture.
		var max = -1
		var image1 = null
		var image2 = null

		for(var i = 0; i < cluster.tweets.length; i++)
			if(cluster.tweets[i].hasMedia() && (max === -1 || cluster.tweets[i].getRetweetCount() > max)) {
				max = cluster.tweets[i].getRetweetCount()
				image1 = cluster.tweets[i].getMedia()
				if(cluster.tweets[i].user.isVerified())
					image2 = image1
			}

		if(image2 !== null)
			return image2
		else
			return image1
	}

	this.getMostRelevantImages = function(cluster, max_n) {
		// Comparator.
		compareImportance = function(image1, image2)  {
		    var count1 = image1.follow_count
		    // if(image1.is_verified === true) count1 += 10000
		    var count2 = image2.follow_count
		    // if(image2.is_verified === true) count2 += 10000

	    	return (count2 - count1)
		}
		var maxOrder = new PriorityQueue({comparator : compareImportance});

		// Find the most relevant pictures.
		var found = 0

		for(var i = 0; i < cluster.tweets.length; i++)
			if(cluster.tweets[i].hasMedia()) {
				var follow_count = cluster.tweets[i].user.getFollowersCount()
				var image = cluster.tweets[i].getMedia()
				var is_verified = cluster.tweets[i].user.isVerified()
				maxOrder.queue({ image: image, follow_count: follow_count, is_verified: is_verified })
				found += 1
			}

		var images = []
		for(var i = 0; i < found && i < max_n; i++) {
			var image = maxOrder.dequeue()
			// console.log(image)
			images.push(image.image)
		}

		return images
	}

	this.getMostRelevantTweets = function(cluster, max_n) {
		// Comparator.
		compareImportance = function(a, b)  {
		    var count1 = a.follow_count
		    var count2 = b.follow_count

	    	return (count2 - count1)
		}
		var maxOrder = new PriorityQueue({comparator : compareImportance});

		// Find the most relevant tweets.
		var found = 0

		for(var i = 0; i < cluster.tweets.length; i++) {
			var follow_count = cluster.tweets[i].user.getFollowersCount()
			var is_verified = cluster.tweets[i].user.isVerified()
			maxOrder.queue({ id: i, follow_count: follow_count, is_verified: is_verified })
			found += 1
		}

		var tweets = []
		for(var i = 0; i < found && i < max_n; i++) {
			var tweet = maxOrder.dequeue()
			// console.log(tweet)
			tweets.push(cluster.tweets[tweet.id])
		}

		return tweets
	}

	this.getVerifiedUsersTalking = function(cluster, metrics, max_n) {
		// Comparator.
		compareImportance = function(a, b)  {
		    var count1 = a.follow_count
		    var count2 = b.follow_count

	    	return (count2 - count1)
		}
		var proMaxOrder = new PriorityQueue({comparator : compareImportance});
		var againstMaxOrder = new PriorityQueue({comparator : compareImportance});

		var found1 = 0
		var found2 = 0

		for(var i = 0; i < cluster.tweets.length; i++)
			if(metrics[i].sentiment !== null) {
				var follow_count = cluster.tweets[i].user.getFollowersCount()
				var is_verified = cluster.tweets[i].user.isVerified()
				if(metrics[i].sentiment.type === 'positive') {
					proMaxOrder.queue({ user: cluster.tweets[i].user, follow_count: follow_count, is_verified: is_verified })
					found1 += 1
				} else if(metrics[i].sentiment.type === 'negative') {
					againstMaxOrder.queue({ user: cluster.tweets[i].user, follow_count: follow_count, is_verified: is_verified })
					found2 += 1
				}
			}

		var pro_users = []
		for(var i = 0; i < found1 && pro_users.length < max_n; i++) {
			var user = proMaxOrder.dequeue().user

			// See if already added.
			var mark = true
			for(var j = 0; j < pro_users.length; j++)
				if(pro_users[j].id === user.id) {
					mark = false
					break
				}

			if(mark === true) {
				// console.log(user)
				pro_users.push(user)
			}
		}

		var against_users = []
		for(var i = 0; i < found2 && against_users.length < max_n; i++) {
			var user = againstMaxOrder.dequeue().user

			// See if already added.
			var mark = true
			for(var j = 0; j < against_users.length; j++)
				if(against_users[j].id === user.id) {
					mark = false
					break
				}

			if(mark === true) {
				// console.log(user)
				against_users.push(user)
			}
		}

		return { pro: pro_users, against: against_users }
	}

	this.getGraphData = function(cluster, metrics) {
		// Split in
		var slices = Math.floor(cluster.tweets.length / 20)
		if(slices < 20)
			slices = 20

		// Get graph boundaries.
		var min_t = 1662024219000
		var max_t = 0
		for(var i = 0; i < cluster.tweets.length; i++)
			if(metrics[i].sentiment !== null && metrics[i].sentiment !== 'neutral') {
				var t = cluster.tweets[i].getCreatedAt().getTime()
				if(t < min_t) min_t = t
				if(t > max_t) max_t = t + 1
			}

		pro_data = new Array(slices).fill(0)
		against_data = new Array(slices).fill(0)

		for(var i = 0; i < cluster.tweets.length; i++)
			if(metrics[i].sentiment !== null) {
				var t = cluster.tweets[i].getCreatedAt().getTime()
				var p = Math.floor(slices * 1.0 *  (t - min_t) / (max_t - min_t))
				if(metrics[i].sentiment.type === 'positive') {
					pro_data[p] += 1
				} else if(metrics[i].sentiment.type === 'negative') {
					against_data[p] += 1
				}
			}

		// Labels.
		var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		var date = new Date(min_t)
		labels = [date.getHours() + ':' + date.getMinutes() + ' '+ date.getDate() + ' ' + months[date.getMonth()]]
		// for(var i = 0; i < slices / 3; i++) labels.push('')
		//labels.push('14 Jun')
		//date = new Date(new Date((max_t - min_t) / 3 + min_t) * 1000)
		// labels.push(date.getHours() + ':' + date.getMinutes())
		//labels.push(new Date((max_t - min_t) / 4 + min_t) * 1000)
		//for(var i = 0; i < slices / 3; i++) labels.push('')
		//labels.push('14 Jun')
		//labels.push(new Date((max_t - min_t) / 2 + min_t) * 1000)
		for(var i = 0; labels.length < slices - 1; i++) labels.push('')
		date = new Date(max_t)
		labels.push(date.getHours() + ':' + date.getMinutes() + ' '+ date.getDate() + ' ' + months[date.getMonth()])
		//labels.push(new Date(max_t * 1000))
		// console.log({ pro: pro_data, against: against_data })
		return { pro: pro_data, against: against_data, labels: labels }
	}

	this.getSummary = function(cluster, n_max, onCompletion) {
		var callback = function(keywords, error) {
			// Important keywords for clustering.
			var importantKeywords = Local.query.query.q.split(" ").filter(
				function(word) { return (word.length !== 0) })

			summary = []
			for(var i = 0; i < keywords.length && summary.length < n_max; i++) {
				var key = keywords[i].text

				if(keywords[i].relevance < 0.3)
					continue

				if(key.split(' ').length < 3)
					continue

				var mark = false
				for(var j = 0; j < importantKeywords.length; j++)
					if(key.search(importantKeywords[i]) !== -1) {
						mark = true
						break
					}

				if(mark === false)
					continue

				if(key !== removeUrl(key))
					continue

				// console.log(key + ' ' + keywords[i].relevance)
				summary.push(keywords[i])
			}

			onCompletion(summary)
		}

		// Compute summary from keywords.
		Alchemy.tweetsAsText('keywords', cluster.tweets, callback)
	}

	function runMetrics(cluster) {
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

			// Number of followers.
			var followers = tweet.user.getFollowersCount()
			if(followers > 10000)
				metrics[i].user_popular = 1.0
			else if(followers > 1000)
				metrics[i].user_popular = 0.5
			else
				metrics[i].user_popular = 0.25

			// Total score.
			metrics[i].score = 
				metrics[i].question * 
				metrics[i].long * 
				metrics[i].user_verified * 
				metrics[i].user_popular
		}

		return metrics
	}

	this.analyzeCluster = function(cluster, onCompletion) {
		var analysis = {}
		var reverse = false

		// Asynchronous calls sync here.
		var sync_count = 2
		var sync = function() {
			sync_count -= 1
			// On full sync, return the analysis.
			if(sync_count === 0)
				onCompletion(analysis)
		}

		// Run standard metrics.
		analysis.metrics = runMetrics(cluster)
		var metrics = analysis.metrics

		// Popular images.
		analysis.images = this.getMostRelevantImages(cluster, 10)

		// Popular tweets.
		analysis.popular_tweets = this.getMostRelevantTweets(cluster, 20)

		// Quick summary.
		var summaryCallback = function(summary) {
			analysis.summary = summary
			sync()
		}
		this.getSummary(cluster, 10, summaryCallback)

		// Remove urls.
		removeUrls(cluster.tweets)

		// Analyze sentiments.
		var callback = function(sentiments, error) {
			// Add urls back
			addUrlsBack(cluster.tweets)

			var negative = 0
			var positive = 0

 			for(var i = 0; i < cluster.tweets.length; i++) {
 				// Save metric.
 				if(reverse === true) {
 					if(sentiments[i].type === 'positive')
 						sentiments[i].type = 'negative'
 					else if(sentiments[i].type === 'negative')
 						sentiments[i].type = 'positive'
 				}

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

			// Verified users.
 			analysis.verified_users = Analysis.getVerifiedUsersTalking(cluster, metrics, 5)

 			// Big graph data.
 			analysis.graph_data = Analysis.getGraphData(cluster, metrics)

			sync()  // Sync.
		}

		var callback2 = function(sentiment, error) {
			if(sentiment !== null && sentiment.type === 'negative') {
				reverse = true
				console.log('reverse')
			}

			Alchemy.tweetsAsArray('sentiment', cluster.tweets, callback)
		}

		Alchemy.text('sentiment', Local.query.query.q, callback2)
	}
}
