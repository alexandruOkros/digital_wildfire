//
// Holds local data in browser, i.e, search data, clusters, analysis data.
//

Local = new function() {
	// Query object for searches.
	this.query = null

	// Tweets returned from the search.
	this.tweets = null

	// Cluster data.
	this.clusters = null

	// Keywords for clusters.
	this.keywords = null

	// Analysis.
	this.cluster_id = 0
	this.analysis = null

	// Trends.
	this.trends = []
}