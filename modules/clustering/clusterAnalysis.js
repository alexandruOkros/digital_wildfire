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
        console.log(a[i] + " put in counter");
    }
    counter[a[i]]++;
 	}
 	var done = {};
 	for (var i in a) {
 		if (!(a[i] in done)) {
      var k = new clusterCount(a[i],counter[a[i]]);
      console.log(" " + k.val);
 			maxOrder.queue(k);
 			done[a[i]] = 1;
      console.log(a[i] + " done")
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
// to find 3 most common entitities
// entitiesCluster(array of tweets, sentiment data) : [String]


  //var popular = []
function entitiesCluster(cluster) {
	var concatEntities = [];


  function callbackEntities(entities, error) {

    for (i = 0; i < entities.length; i++) {
      for ( j = 0; j < entities[i].length; j++){
        var ent = entities[i][j].text;
        concatEntities.push(ent);
      }
    }
    popular = modeCalc(concatEntities,3);
    console.log(popular);
  }
    Alchemy.entitiesTweetsAsArray(cluster.tweets,callbackEntities);
    //return popular;
}

//  returns array of tweets that have all three keywords found by entitiesCluster
function relevantTweetsCluster(cluster) {
	//var entitiesMain = entitiesCluster(cluster,sentiments);
 
  function callbackRelevant(entities, error) {

    var concatEntities = [];
    for (i = 0; i < entities.length; i++) {
      for ( j = 0; j < entities[i].length; j++){
        var ent = entities[i][j].text;
        concatEntities.push(ent);
      }
    }
    popular = modeCalc(concatEntities,3);
      
    console.log(popular);
    var rel = [];
    for (i = 0; i < entities.length; i++) {
      var allEnt = [];
      for ( j = 0; j < entities[i].length; j++){
        var ent = entities[i][j].text;
        allEnt.push(ent);
      }
      if(allEnt.contains(popular[0]) && allEnt.contains(popular[1]) && allEnt.contains(popular[2])) 
      console.log(cluster.tweets[i].text)
      rel.push(cluster.tweets[i]);
    }
  }

	//for (i = 0 ; i < cluster.length; i++){
		//var twt = cluster[i]tweets;
		//Alchemy.entitiesTweet(twt,callbackRelevant)
    Alchemy.entitiesTweetsAsArray(cluster.tweets,callbackRelevant);
    //if (ent.contains(entitiesMain[0]) && ent.contains(entitiesMain[1]) && ent.contains(entitiesMain[2])) {
		//rel.push(cluster[i]);
		//}
	}

	


}
// returns average sentiment of the cluster calculated as the mean
function sentimentCluster(cluster) {
	var sent = 0;
	function callbackSenti(sentiment,error){
    for (i = 0; i< sentiment.length; i++) {
		  sent = sent + sentiment[i].score;
	  }
	  var avg = sent/(sentiment.length);
    console.log(avg);
  }
  Alchemy.sentimentTweetsAsArray(cluster.tweets,callbackSenti);
}
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
function popularityCluster(cluster) {
	var retweetcount= 0;
	for (i = 0; i< cluster.length; i++) {
		if (cluster.tweets[i].hasRetweetCount()) {
			retweetcount = retweetcount + cluster.tweets[i].getRetweetCount();
		}
	}
	var avg = retweetcount/(cluster.length);
	console.log(avg);
}
// adds methods to each cluster using methods above 
function toClusterObject(cluster) {
	cluster.getEntities = function() {
		entitiesCluster(cluster);
	}

	cluster.getRelevantTweets = function() {
		relevantTweetsCluster(cluster);
	}

	cluster.getSentiment = function() {
		sentimentCluster(cluster);
	}

	cluster.getPopularity = function() {
		popularityCluster(cluster);
	}

	//cluster.getLocation = function() {
		//return locationCluster(cluster);
	//}

	return cluster;


}
// takes an array of clusters and converts each cluster into a clusterObject
function clusterAnalysis(clusters) {
	var clusterObjects = [];
	for (i = 0 ; i < clusters.length; i++) {
    var co = new toClusterObject(clusters[i]);
    co.getEntities;
    co.getRelevantTweets;
    co.getSentiment;
    co.getPopularity;

		clusterObjects.push(co);

	}
	//return clusterObjects;
}



