// The main part of the clustering operation of the tweets. takes an aray of tweets (tweets), and the sentiment data from AlchAPI (in whatever for that comes) (sentiments), and returns an array of array of tweets, with each sub array being a cluster.

Clustering = new function() {
    // vectorise take a tweet and vectorises it over the words chosen by the tweetChooser, including the sentiment in the scaling
    function vectorise(tweet, words) {
        var v = [];
        var tweetText = tweet.getText().toLowerCase();

        for(var k = 0; k < words.length; k++) {
            v[k] = 0;
            if (tweetText.indexOf(words[k].text.toLowerCase()) > - 1) {
                v[k] = parseFloat(words[k].relevance);
            }
        }
        return v;
    }

    // difference takes 2 tweet's vectors, which have been vectorised, and calculates the dot product difference between them
    function similarity(tweet1Vector, tweet2Vector) {
        var total = 0.0, i = 0, v1tot = 0, v2tot = 0;
        // console.log(tweet1Vector)
        for (i = 0; i < tweet1Vector.length; i++) {
            total += Math.sqrt(tweet1Vector[i] * tweet2Vector[i]);
            v1tot += tweet1Vector[i];
            v2tot += tweet2Vector[i];
        }
        if(v1tot === 0 || v2tot === 0)
            return 0
        else
            return (total/(Math.sqrt(v1tot) * Math.sqrt(v2tot)));
    }

    // difference takes 2 tweet's vectors, which have been vectorised, and calculates the dot product difference between them
    function similarity2(tweet1Vector, tweet2Vector) {
        var total = 0.0, i = 0, v1tot = 0, v2tot = 0;
        // console.log(tweet1Vector)
        for (i = 0; i < tweet1Vector.length; i++) {
            total += Math.sqrt(tweet1Vector[i] * tweet2Vector[i]);

        }

        return (total);
    }

    // hardClustering takes tweets chosen over a vector space of words provided 
    // (both parameters of the object returned by tweetChooser), but as it's 
    // O(log(n)n^2) time we only do it on a small covering sample of all the 
    // tweets, and then use the clusters generated as the base clusters for the 
    // rest of the tweets to be attached to. returns an array of clusterNum 
    // cluster objects, with 2 parameters: tweets, an array of tweets; and
    // centroid, the calculated centre of each cluster over the vector space of 
    // chosen words. :: object of array of tweets, array of words; json object 
    // of sentiments, number => array of objects of array of tweets, array of 
    // words.
    function hardClustering(clusterNum, tweets, keywords) {
        // Info.
        console.log("Using " + keywords.length + " keywords for clustering.");
        console.log("Hard-clustering " + tweets.length + " tweets.");
        console.log("Aiming for: " + clusterNum + " clusters.");

        // compareNumbers :: diffValue, diffValue => Number
        compareNumbers = function (a, b) { return (b.value - a.value); };
        maxOrder = new PriorityQueue({ comparator : compareNumbers });

        // diffvalue :: number, number, number => diffValue
        function DiffValue(diff, xco, yco) {
            this.value = diff;
            this.x = xco;
            this.y = yco;
        }

        /*
        console.log("check1");
        // vectorises all the tweets
        for (i = 0; i < tweets.length; i++) {
            tweets[i].vector = vectorise(tweets[i], keywords);
        }
        */
        
        // inserts each possible difference between 2 points into the priority 
        // queeue as an object with coordinates and and value of the difference.
        for (var i = 0; i < tweets.length; i++) {
            for (var j = 0; j < tweets.length; j++) {
                maxOrder.queue(new DiffValue(similarity(tweets[i].vector, tweets[j].vector), i, j));
            } 
        }
        
        // clusters is the array of arrays of tweet ids which will be the finished
        // prooduct; clustersLocation is an array saying which cluster each tweet is
        // in (initially -1); clusterCount is the amount of clusters (abstractally 
        // imagining every tweet initially as a cluster); clusterPace is a stack of 
        // locations where new clusters can be put in the clusters array.
        var clusters = [[]];
        clusterLocations = new Array(tweets.length);
        clusterCount = tweets.length;
        clusterPlace = new Array(tweets.length);
        v = maxOrder.dequeue()
        place = 0;

        for (i = 0; i < tweets.length; i++) {
            clusterLocations[i] = -1;
            clusterPlace.push((tweets.length - 1) - i);
        } // initialising the arrays

        console.log("check2");
        // the main clustering operation is performed here
        var rounds = 0;
        // console.log("starting hardClustering loop");
        while (clusterCount > clusterNum && rounds < 5000) {
            console.log(v.value);
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

        /*
        if(clusters.length < clusterNum) {
            for(i = 0; i < tweets.length; i++){
                if(clusterLocations[i] === -1) {
                    place = clusterPlace.pop();
                    clusters[place] = [i];
                    clusterLocations[i] = place;
                }
            }
        }
        */

        // :: array of numbner => cluster object
        function computeCentroid(xs) {
            var total = new Array(keywords.length).fill(0)

            for (var j = 0; j < xs.length; j++)
                for (var i = 0; i < keywords.length; i++)
                    total[i] += tweets[xs[j]].vector[i];

            for (var i = 0; i < keywords.length; i++)
                total[i] = total[i] / (xs.length);

            return total
        }

        var centroids = []
        for(var j = 0; j < clusters.length; j++){
            var tCluster = clusters[j];
            if (tCluster.length !== 0)
                centroids.push(computeCentroid(tCluster))
        }
        
        return centroids;
    }

    // easyClustering takes an array of array of tweets with each sub array being a cluster, and takes the rest of the tweets to be clustered, as well as teh words over which the clustering is being done. it returns an array of array of tweets, with each sub array being a cluster, with all the tweets now in one of the clusters.
    function easyClustering(centroids, tweets, keywords) {
        console.log("start of easyclustering");  // Info.

        // Initialise.
        var clusters = []
        for(var i = 0; i < centroids.length; i++)
            clusters[i] = { tweets: [], centroid: centroids[i] }

        // Assign a cluster to each tweet.
        for (var i = 0; i < tweets.length; i++) {
            tweets[i].vector = vectorise(tweets[i], keywords);

            var max = 0;
            for (var j = 0; j < centroids.length; j++) {
                if (similarity2(tweets[i].vector, centroids[j]) > max) {
                    max = j;
                }
            }

            clusters[max].tweets.push(tweets[i]);
        }

        // could possible calculate overall centroids here and then possibly 
        // merge very similar clusters, but if not:
        return clusters
    }

    // tweetChooser takes all the tweets and sentiment data, and picks out the 
    // 15 best words to find tweets from using the most common word occurences, 
    // and then chooses N tweets from the data to try and represent the whole 
    // sample as best as possible including the sentiment of the tweets on the 
    // terms. so it returns: object with 2 parameters, words: array size 15 of 
    // string with all the words chosen to cover (all lowercase), and 
    // tweets: Array size N of tweets chosen.
    function tweetChooser(tweetNum, keywords, tweets) {
        var compareNumbers1 = function (tweet1, tweet2) { return (similarity(tweet2.vector, tweet2.vector) - similarity(tweet1.vector, tweet1.vector)); };
        var maxOrder1 = new PriorityQueue({ comparator : compareNumbers1 });
        
        // Push all tweets in the priority queue.
        for (var i = 0; i < tweets.length; i++) {
            tweet = tweets[i];
            tweet.vector = vectorise(tweet, keywords);
            maxOrder1.queue(tweet);
        }

        // Pick first tweetNum tweets.
        var chosenTweets = [];
        for (var j = 0; j < tweetNum; j++)
            chosenTweets.push(maxOrder1.dequeue());

        return chosenTweets
    }

    function computeCentroids(clusters, keywords) {
        // For every cluster.
        for(var i = 0; i < clusters.length; i++) {
            var centroid = new Array(keywords.length).fill(0)
            // Sum.
            for(var j = 0; j < clusters[i].tweets.length; j++)
                for(var k = 0; k < keywords.length; k++)
                    centroid[k] += clusters[i].tweets[j].vector[k]

            // Average.
            for(var k = 0; k < keywords.length; k++) {
                centroid[k] = centroid[k] / (clusters[i].tweets.length)
                if(centroid[k] < 0.05)  centroid[k] = 0
            }

            // Save data.
            clusters[i].centroid = centroid
        }

        return clusters
    }

    function cluster(tweetNum, clusterNum, tweets, importantKeywords, keywords, callback) {
        // Pick a small batch of tweets for hardClustering.
        var chosenTweets = tweetChooser(tweetNum, keywords, tweets)

        var centroids = hardClustering(clusterNum, chosenTweets, keywords);
        
        var clusters = easyClustering(centroids, tweets, keywords);

        // Post-processing.
        // Re-compute the centroids.
        clusters = computeCentroids(clusters, keywords)

        // Filter out unrelated clusters.
        if(importantKeywords !== null)
        clusters = clusters.filter(function(cluster) {
            for(var i = 0; i < cluster.centroid.length; i++)
                if(cluster.centroid[i] > 0 && importantKeywords[i] === true)
                    return true

            return false
        })

        // If a cluster is included in another, join them (included keyword-wise).
        // TODO.
        
        // Filter out empty clusters.
        clusters = clusters.filter(function(cluster) {
            return (cluster.tweets.length !== 0)
        })

        // Return clusters and the used keywords.
        callback({ clusters: clusters, keywords: keywords })
    }

    this.main = function(importantKeywords, tweets, callback) {
        // returns a good proportion of tweets to take for hard clustreing: approx 200 of 1000, or 600 of 10000.
        // var N = 6 * Math.ceil(Math.sqrt(tweets.length)), k = 15;
        var N = 2.1 * Math.ceil(Math.sqrt(tweets.length));
        N = Math.min(N, tweets.length)  // Careful.
        var k = 15;

        var callbackKeywords = function(keywords, error) {
            var mark = false
            var important = []

            // Compute the importantKeywords.
            for(var i = 0; i < keywords.length; i++) {
                important[i] = false
                for(var j = 0; j < importantKeywords.length; j++)
                    if(keywords[i].text.toLowerCase() === 
                            importantKeywords[j].toLowerCase()) {
                        important[i] = true
                        mark = true
                        break
                    }
            }

            // No important keywords.
            if(mark === false) important = null

            cluster(N, k, tweets, important, keywords, callback)
        }

        // Get the keywords for clustering
        Alchemy.getKeywords("", tweets, callbackKeywords);
    }
}