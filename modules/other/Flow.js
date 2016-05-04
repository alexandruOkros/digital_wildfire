
//
// Flow.
//
Flow = new function() {
	this.initialise = function() {
		// Start looking for trends.
		// Flow.fetchTrending()

	}

	// Load trends.
	this.fetchTrending = function() {
		UI.showLoadingTrends()

		// Get trending topics right now in London.
		var callback = function(error, trends, response) {
			UI.showTrends(trends)

			// Save data.
			Local.trends = trends
		}

		// Get trends from Twitter.
		Twitter.getTrends("London", callback);
		// Call again in 5+ mins.
		setTimeout(function() { Flow.fetchTrending() }, 310 * 1000)
	}

	// Search for a string and display the results.
	this.search = function() {
		// Update the UI.
		UI.showLoadingSearch()

	 	// Get the search parameters.
		query = UI.grabSearchQuery()

		var callback = function(error, tweets, response) {
			Flow.initialTweets(tweets)
		}

		if(query.query.which === -1)
			Twitter.searchTweets(query, callback);  // Search live on twitter.
		else if(query.query.which === 4)
			Twitter.demo(query, callback);
		else
			Twitter.searchArchive(query, callback);  // Search the archieve
	};

	this.initialTweets = function(tweets) {
		// Save local data.
		Local.tweets = tweets

		// Print the tweets.
		UI.showTweets(tweets)
		UI.testCluster(tweets)
		return
		if(tweets.length !== 0)
			Flow.initialClustering(tweets)
	}

	this.initialClustering = function(tweets) {
		UI.showLoadingClusters()
		UI.switchTabs('tweets', 'clusters')

		// Get clusters.
		var callback = function(data) {
			// Save local data.
			Local.clusters = data.clusters
			Local.keywords = data.keywords

			UI.showClusters(data.clusters, data.keywords)
		}

		// Important keywords for clustering.
		var importantKeywords = Local.query.query.q.split(" ").filter(
			function(word) { return (word.length !== 0) })

		// Compute clusters.
		Clustering.main(importantKeywords, tweets, callback)
	}

	this.analyzeCluster = function(id) {
		UI.switchTabs('clusters', 'analysis')

		var callback = function(cluster_obj) {
			UI.showAnalysis(cluster_obj)
		}

		// Analyze.
		Analysis.analyzeCluster(Local.clusters[id], callback)
	}
}
