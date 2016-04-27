// The main part of the clustering operation of the tweets. takes an aray of tweets (tweets), and the sentiment data from AlchAPI (in whatever for that comes) (sentiments), and returns an array of array of tweets, with each sub array being a cluster.

// vectorise take a tweet and vectorises it over the words chosen by the tweetChooser, including the sentiment in the scaling
function vectorise(tweet, words) {
    var v = [], k = 0;
    var tweetText = tweet.getText().toLowerCase();
    for (k = 0; k < words.length; k++) {
        v[k] = 0;
        if (tweetText.indexOf(words[k].text.toLowerCase()) > - 1) {
//            function callback1(sentiment, error) {
//                v[k] = sentiment * (words[k].relevance);
//               console.log("callbackworking?");
//            }
//            Alchemy.sentimentTargetedTweet(tweet, words[k], callback1);
            v[k] = parseFloat(Math.max(words[k].relevance, 0.4));
        }
    }
    // console.log(v);
    return v;
}


// difference takes 2 tweet's vectors, which have been vectorised, and calculates the dot product difference between them
function similarity(tweet1Vector, tweet2Vector) {
    var total = 0.0, i = 0, v1tot = 0, v2tot = 0;
    for (i = 0; i < tweet1Vector.length; i++) {
        total += Math.sqrt(tweet1Vector[i] * tweet2Vector[i]);
        v1tot += tweet1Vector[i];
        v2tot += tweet2Vector[i];
    }
    return (total/(Math.sqrt(v1tot) * Math.sqrt(v2tot)));
}

// tweetChooser takes all the tweets and sentiment data, and picks out the 15 best words to find tweets from using the most common word occurences, and then chooses N tweets from the data to try and represent the whole sample as best as possible including the sentiment of the tweets on the terms. so it returns: object with 2 parameters, words: array size 15 of string with all the words chosen to cover (all lowercase), and tweets: Array size N of tweets chosen
function tweetChooser(tweets, tweetNum, clusterNum) {
    var chosenWords = [];
    var compareNumbers1 = function (tweet1, tweet2) { return (similarity(tweet2.vector, tweet2.vector) - similarity(tweet1.vector, tweet1.vector)); };
    var maxOrder1 = new PriorityQueue({ comparator : compareNumbers1 });
    var chosenTweets = [], i = 0, j = 0, tweet = tweets[i], result = new Chosen([], []);
    
    function callback2(keywords, error) {
        chosenWords = keywords;
        // chosenWords.length = 15;
        
        for (i = 0; i < tweets.length; i++) {
            tweet = tweets[i];
            tweet.vector = vectorise(tweet, chosenWords);
            maxOrder1.queue(tweet);
        }
        
        while (j < tweetNum) {
            chosenTweets.push(maxOrder1.dequeue());
            j += 1;
        }
        result = new Chosen(chosenTweets, chosenWords);
        
        var result2 = hardClustering(result, clusterNum);
        
        var result3 = easyClustering(result2, tweets);

        // Filter out empty clusters.
        var filterClusters = function (clusters) {
            var filtered_clusters = [];

            for (var i = 0; i < clusters.length; ++i)
                if(clusters[i].tweets.length !== 0)
                    filtered_clusters.push(clusters[i]);

            return filtered_clusters;
        }
        
        Local.clusters = filterClusters(result3);
        console.log(Local.clusters);
        showClusters(Local.clusters);

        // Do the analysis.
        doAnalysis();
    }
    function Chosen(array1, array2) {
        this.tweets = array1;
        this.words = array2;
    }
    Alchemy.getKeywords("", tweets, callback2);
}

// hardClustering takes tweets chosen over a vector space of words provided 
// (both parameters of the object returned by tweetChooser), but as it's 
// O(log(n)n^2) time we only do it on a small covering sample of all the tweets,
// and then use the clusters generated as the base clusters for the rest of 
// the tweets to be attached to. returns an array of clusterNum cluster objects,
// with 2 parameters: tweets, an array of tweets; and centroid, the calculated 
// centre of each cluster over the vector space of chosen words.
// :: object of array of tweets, array of words; json object of sentiments, number => array of objects of array of tweets, array of words
function hardClustering(chosen, clusterNum) {
    var words = chosen.words;
    console.log("Using " + words.length + " keywords for clustering.");
    console.log("Hard-clustering " + chosen.tweets.length + " tweets.");
    console.log("aiming for: " + clusterNum + " clusters");
    compareNumbers = function (a, b) { return (b.value - a.value); };
    maxOrder = new PriorityQueue({ comparator : compareNumbers });
    i = 0;
    j = 0;

    // compareNumbers :: diffValue, diffValue => Number
    // diffvalue :: number, number, number => diffValue
    function DiffValue(diff, xco, yco) {
        this.value = diff;
        this.x = xco;
        this.y = yco;
    }
    console.log("check1");
    // vectorises all the tweets
    for (i = 0; i < chosen.tweets.length; i++) {
        chosen.tweets[i].vector = vectorise(chosen.tweets[i], words);
    }
    
    // inserts each possible difference between 2 points into the priority 
    // queeue as an object with coordinates and and value of the difference.
    for (i = 0; i < chosen.tweets.length; i++) {
        for (j = 0; j < chosen.tweets.length; j++) {
            maxOrder.queue(new DiffValue(similarity(chosen.tweets[i].vector, chosen.tweets[j].vector), i, j));
        } 
    }
    
    // clusters is the array of arrays of tweet ids which will be the finished
    // prooduct; clustersLocation is an array saying which cluster each tweet is
    // in (initially -1); clusterCount is the amount of clusters (abstractally 
    // imagining every tweet initially as a cluster); clusterPace is a stack of 
    // locations where new clusters can be put in the clusters array.
    var clusters = [[]];
    clusterLocations = new Array(chosen.tweets.length);
    clusterCount = chosen.tweets.length;
    clusterPlace = new Array(chosen.tweets.length);
    v = maxOrder.dequeue()
    place = 0;

    for (i = 0; i < chosen.tweets.length; i++) {
        clusterLocations[i] = -1;
        clusterPlace.push((chosen.tweets.length - 1) - i);
    } // initialising the arrays

    console.log("check2");
    // the main clustering operation is performed here
    var rounds = 0;
    // console.log("starting hardClustering loop");
    while (clusterCount > clusterNum && rounds < 1000) {
        rounds = rounds + 1;
        // console.log("round: " + rounds);
        if (v.x === v.y) { // console.log("check2.1"); // if it's a difference bwteen the same element ignore it
        } else if ((clusterLocations[v.x] === -1) && (clusterLocations[v.y] === -1)) { // console.log("check2.2"); // if neither tweet is in a cluster then make a new cluster with just those 2 tweets in 
            // console.log("case 1");
            place = clusterPlace.pop();
            clusterLocations[v.x] = place;
            clusterLocations[v.y] = place;
            clusters[place] = [v.x, v.y];
            clusterCount -= 1;
            // console.log("case 1 end");
        } else if (clusterLocations[v.x] === -1) { // console.log("check2.3"); // if one of the tweets is in a cluster add the other to it
            // console.log("case 2");
            clusterLocations[v.x] = clusterLocations[v.y];
            clusters[clusterLocations[v.y]].push(v.x);
            clusterCount -= 1;
            // console.log("case 2 end");
        } else if (clusterLocations[v.y] === -1) { // console.log("check2.4");// as above
            // console.log("case 3");
            clusterLocations[v.y] = clusterLocations[v.x];
            clusters[clusterLocations[v.x]].push(v.y);
            clusterCount -= 1;
            // console.log("case 3 end");
        } else if (clusterLocations[v.y] === clusterLocations[v.x]) { // console.log("check2.5"); // if the 2 points are already in the same cluster (might never happen) do nothing
        } else { // console.log("check2.6");// find the cluster with the small size (for efficiency) then add that cluster to the other one
            // console.log("case 4");

            if (clusters[clusterLocations[v.y]].length > clusters[clusterLocations[v.x]].length) { // console.log("check2.7");
                var sourceCluster = clusterLocations[v.x];
                var destCluster = clusterLocations[v.y];
            } else { // console.log("check2.8");
                var sourceCluster = clusterLocations[v.y];
                var destCluster = clusterLocations[v.x];
            }

            for (i = 0; i < clusters[sourceCluster].length; i++) {
                tweetId = clusters[sourceCluster][i];
                clusters[destCluster].push(tweetId);
                clusterLocations[tweetId] = destCluster;
            }

            clusterPlace.push(sourceCluster);
            clusters[sourceCluster] = []; // clears the array so we know there's no cluster there
            clusterCount -= 1;
            // console.log("case 4 end");
        }
        // console.log("fetching v");
        v = maxOrder.dequeue();
        // console.log(v.value);
        // console.log("fetched v");
    }
    
    // console.log("end of hardClustering main loop");

    if(clusters.length < clusterNum) {
        for(i = 0; i < chosen.tweets.length; i++){
            if(clusterLocations[i] === -1) {
                place = clusterPlace.pop();
                clusters[place] = [i];
                clusterLocations[i] = place;
            }
        }
    }
    console.log(clusters);
    // :: array of numbner => cluster object
    function Clustered(xs) {
        var clTweets = [], total = new Array(chosen.words.length).fill(0), j = 0;
        for (j = 0; j < xs.length; j++) {
            clTweets.push(chosen.tweets[xs[j]]);
            for (i = 0; i < chosen.words.length; i++) {
                total[i] += chosen.tweets[xs[j]].vector[i];
            }
        }
        for (i = 0; i < chosen.words.length; i++) {
            total[i] = total[i] / (clTweets.length);
        }
        this.tweets = []; // this is empty instead of having the tweets in as those tweets are still in teh central array of all tweets to be clustered, 
                          // so will be added again when easyClustering happens. it's easier to remove teh tweets here, with teh assumption that they'll most 
                          // likely be added to the same cluster, then to remove them as they're chosen, or to ignore them as we add them.
        this.words = chosen.words;
        this.centroid = total;
    }

    var finalClusters = [], tCluster = [], toPlace = 0;
    for(j = 0; j < clusters.length; j++){
        tCluster = clusters[j];
        if (tCluster.length !== 0) {
            finalClusters[toPlace] = new Clustered(tCluster);
            toPlace +=1;
        }
    }
    
    return finalClusters;
}

// easyClustering takes an array of array of tweets with each sub array being a cluster, and takes the rest of the tweets to be clustered, as well as teh words over which the clustering is being done. it returns an array of array of tweets, with each sub array being a cluster, with all the tweets now in one of the clusters.
function easyClustering(tweetClusters, tweets) {
    var vSpaceWords = tweetClusters[0].words, i = 0, j = 0, max = 0, clusters = [];
    console.log("start of easyclustering");
    for (i = 0; i < tweets.length; i++) {
        tweets[i].vector = vectorise(tweets[i], vSpaceWords);
        max = 0;
        for (j = 0; j < tweetClusters.length; j++) {
            if (similarity(tweets[i].vector, tweetClusters[j].centroid) > max) {
                max = j;
            }
        }
        tweetClusters[max].tweets.push(tweets[i]);
    }
    // could possible calculate overall centroids here and then possibly merge very similar clusters, but if not:
    return tweetClusters;
}

function mainClustering(tweets) {
    // returns a good proportion of tweets to take for hard clustreing: approx 200 of 1000, or 600 of 10000.
    // var N = 6 * Math.ceil(Math.sqrt(tweets.length)), k = 15;
    var N = 2.1 * Math.ceil(Math.sqrt(tweets.length));
    k = 15;
    tweetChooser(tweets, N, k);
}
