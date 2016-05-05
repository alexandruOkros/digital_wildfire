
//
// Flow.
//
Flow = new function() {
	this.initialise = function() {
		// Start looking for trends.
		Flow.fetchTrending()
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

		if(query.query.demo === true)
			Twitter.demo(query, callback);
		else
			Twitter.searchTweets(query, callback);  // Search live on twitter.
	};

	this.initialTweets = function(tweets) {
		// Save local data.
		Local.tweets = tweets

		// Print the tweets.
		UI.showTweets(tweets)

		if(tweets.length !== 0)
			Flow.initialClustering(tweets)
	}

	this.initialClustering = function(tweets) {
		UI.showLoadingClusters()
		// UI.switchTabs('tweets', 'clusters')

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
		// Save local.
		Local.cluster_id = id

		UI.showLoadingAnalysis()
		UI.switchTabs('clusters', 'analysis')

		var callback = function(analysis) {
			// Save local.
			Local.analysis = analysis

			UI.showAnalysis(analysis)
		}

		// Analyze.
		Analysis.analyzeCluster(Local.clusters[id], callback)
	}
}
