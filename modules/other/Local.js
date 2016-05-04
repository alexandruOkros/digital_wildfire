//
// Holds local data in browser, i.e, search data, clusters, analysis data.
//

Local = new function() {
	// Query object for searches.
	this.query = null;

	// Tweets returned from the search.
	this.tweets = null;

	// Cluster data.
	this.clusters = null;

	// Trends.
	this.trends = []
}