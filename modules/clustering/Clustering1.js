// The main part of the clustering operation of the tweets. takes an aray of tweets (tweets), and the sentiment data from AlchAPI (in whatever for that comes) (sentiments), and returns an array of array of tweets, with each sub array being a cluster.

// vectorise take a tweet and vectorises it over the words chosen by the tweetChooser, including the sentiment in the scaling
function vectorise(tweet, words) {
    var v = [], k = 0;
    var tweetText = tweet.text.toLowerCase();
    for (k = 0; k < words.length; k++) {
        v[k] = 0;
        if (tweetText.indexOf(words[k].text.toLowerCase()) > - 1) {
//            function callback1(sentiment, error) {
//                v[k] = sentiment * (words[k].relevance);
//               console.log("callbackworking?");
//            }
//            Alchemy.sentimentTargetedTweet(tweet, words[k], callback1);
            v[k] = parseFloat(words[k].relevance);
        }
    }
    return v;
}


// difference takes 2 tweet's vectors, which have been vectorised, and calculates the dot product difference between them
function similarity(tweet1Vector, tweet2Vector) {
    var total = 0.0, i = 0;
    for (i = 0; i < tweet1Vector.length; i++) {
        total += tweet1Vector[i] * tweet2Vector[i];
    }
    return total;
}

// tweetChooser takes all the tweets and sentiment data, and picks out the 15 best words to find tweets from using the most common word occurences, and then chooses N tweets from the data to try and represent the whole sample as best as possible including the sentiment of the tweets on the terms. so it returns: object with 2 parameters, words: array size 15 of string with all the words chosen to cover (all lowercase), and tweets: Array size N of tweets chosen
function tweetChooser(tweets, tweetNum, clusterNum) {
    var chosenWords = [];
    var compareNumbers1 = function (tweet1, tweet2) { return (similarity(tweet2.vector, tweet2.vector) - similarity(tweet1.vector, tweet1.vector)); };
    var maxOrder1 = new PriorityQueue({ comparator : compareNumbers1 });
    var chosenTweets = [], i = 0, j = 0, tweet = tweets[i], result = new Chosen([], []);
    
    function callback2(keywords, error) {
        chosenWords = keywords;
        chosenWords.length = 15;
        
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
        
        console.log(result3);
        showClusters(result3);
    }
    function Chosen(array1, array2) {
        this.tweets = array1;
        this.words = array2;
    }
    Alchemy.keywordsTweetsAsText(tweets, callback2);
}

// hardClustering takes tweets chosen over a vector space of words provided (both parameters of the object returned by tweetChooser), but as it's O(log(n)n^2) time we only do it on a small covering sample of all the tweets, and then use the clusters generated as the base clusters for the rest of the tweets to be attached to. returns an array of clusterNum cluster objects, with 2 parameters: tweets, an array of tweets; and centroid, the calculated centre of each cluster over the vector space of chosen words.
// :: object of array of tweets, array of words; json object of sentiments, number => array of objects of array of tweets, array of words
function hardClustering(chosen, clusterNum) {
    var words = chosen.words, compareNumbers = function (a, b) { return (b.value - a.value); }, maxOrder = new PriorityQueue({ comparator : compareNumbers }), i = 0, j = 0;
    // compareNumbers :: diffValue, diffValue => Number
    // diffvalue :: number, number, number => diffValue
    function DiffValue(diff, xco, yco) {
        this.value = diff;
        this.x = xco;
        this.y = yco;
    }
    // vectorises all the tweets
    for (i = 0; i < chosen.tweets.length; i++) {
        chosen.tweets[i].vector = vectorise(chosen.tweets[i], words);
    }
    
    // inserts each possible difference between 2 points into the priority queeue as an object with coordinates and and value of the difference
    for (i = 0; i < chosen.tweets.length; i++) {
        for (j = 0; j < chosen.tweets.length; j++) {
            maxOrder.queue(new DiffValue(similarity(chosen.tweets[i].vector, chosen.tweets[j].vector), i, j));
        }
        
    }
    
    // clusters is the array of arrays of tweet ids which will be the finished prooduct; clustersLocation is an array saying which cluster each tweet is in (initially -1); clusterCount is the amount of clusters (abstractally imagining every tweet initially as a cluster); clusterPace is a stack of locations where new clusters can be put in the clusters array.
    var clusters = [[]], clusterLocations = new Array(chosen.tweets.length), clusterCount = chosen.tweets.length, clusterPlace = new Array(chosen.tweets.length), v = maxOrder.dequeue, place = 0;
    for (i = 0; i < chosen.tweets.length; i++) {
        clusterLocations[i] = -1;
        clusterPlace.push((chosen.tweets.length - 1) - i);
    } // initialising the arrays
    
    // the main clustering operation is performed here
    var rounds = 0;
    while (clusterCount > clusterNum && rounds < 100) {
        rounds = rounds + 1;
        if (v.x === v.y) { // if it's a difference bwteen the same element ignore it
        } else if ((clusterLocations[v.x] === -1) && (clusterLocations[v.y] === -1)) {// if neither tweet is in a cluster then make a new cluster with just those 2 tweets in
            place = clusterPlace.pop();
            clusterLocations[v.x] = place;
            clusterLocations[v.y] = place;
            clusters[place] = [v.x, v.y];
            clusterCount -= 1;
        } else if (clusterLocations[v.x] === -1) { // if one of the tweets is in a cluster add the other to it
            clusterLocations[v.x] = clusterLocations[v.y];
            clusters[clusterLocations[v.y]].push(v.x);
            clusterCount -= 1;
        } else if (clusterLocations[v.y] === -1) { // as above
            clusterLocations[v.y] = clusterLocations[v.x];
            clusters[clusterLocations[v.x]].push(v.y);
            clusterCount -= 1;
        } else if (clusterLocations[v.y] === clusterLocations[v.x]) { // if the 2 points are already in the same cluster (might never happen) do nothing
        } else { // find the cluster with the small size (for efficiency) then add that cluster to the other one
            var tweetId = 0;
            if (clusters[clusterLocations[v.y]].length > clusters[clusterLocations[v.x]].length) {
                for (i = 0; i < clusters[clusterLocations[v.x]].length; i++) {
                    tweetId = clusters[clusterLocations[v.x]][i];
                    clusters[clusterLocations[v.y]].push(tweetId);
                    clusterLocations[tweetId] = clusterLocations[v.y];
                }
                clusterPlace.push(clusterLocations[v.x]);
                clusters[clusterLocations[v.x]] = []; // clears the array so we know there's no cluster there
            } else {
                for (i = 0; i < clusters[clusterLocations[v.y]].length; i++) {
                    tweetId = clusters[clusterLocations[v.y]][i];
                    clusters[clusterLocations[v.x]].push(tweetId);
                    clusterLocations[v.y] = clusterLocations[v.x];
                }
                clusterPlace.push(clusterLocations[v.y]);
                clusters[clusterLocations[v.y]] = []; // clears the array so we know there's no cluster there
            }
        }
        v = maxOrder.dequeue;
    }

    
    if(clusters.length < clusterNum) {
        for(i = 0; i < chosen.tweets.length; i++){
            if(clusterLocations[i] === -1) {
                place = clusterPlace.pop();
                clusters[place] = [i];
                clusterLocations[i] = place;
            }
        }
    }
    // :: array of numbner => cluster object
    function Clustered(xs) {
        var clTweets = [], total = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], j = 0;
        for (j = 0; j < xs.length; j++) {
            clTweets.push(chosen.tweets[xs[j]]);
            for (i = 0; i < 15; i++) {
                total[i] += chosen.tweets[xs[j]].vector[i];
            }
        }
        for (i = 0; i < 15; i++) {
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
    // returns a good proportion of tweets to take for hard clustreing: approx 200 of 100, or 600 of 10000.
    // var N = 6 * Math.ceil(Math.sqrt(tweets.length)), k = 15;
    var N = Math.ceil(tweets.length - 2);
    k = 15;
    tweetChooser(tweets, N, k);
}
