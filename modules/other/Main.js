
// 
// Methods.
//

// Get the search parameters from the UI.
function grabSearchQuery() {
	var query = {
		q: $('#search_bar').val(),
		result_type: "recent",
		count: 100,  // TODO make it 100.
	};

	// Location.
	if($('#location_select').val() === "0")
		query.geocode = Twitter.locations.London;

	// Language.
	if($('#language_select').val() === "0")
		query.lang = Twitter.languages.English;

	// Data from the archive.
	query.which = parseInt($('#imported_data_select').val()) - 1;

	// Parameters.
	if($('#no_results_select').val() === "0")
		params = { pages: 1 };
	else
		params = { pages: 1 };


	Local.query = { query: query, params: params };  // Save.
	return Local.query;
};

// Search for a string and display the results.
function searchString(query) {

	$("#tweets_data").html("Loading ...");
	$("#clusters_data").html("");
	$("#analysis_data").html("");

	var callback = function(error, tweets, response) {
		// Save local data.
		Local.tweets_from_search = tweets;

		var message = "";

		if(tweets.length !== 0) {
			message += "<a href='#demoresults' data-toggle='collapse'>show tweets</a>";
			message += "<div id ='demoresults' class = 'collapse'>";
				
			for(var i = 0; i < tweets.length; ++i)
				message += tweets[i].toString();

			message += "</div>";
		} else {
			message = "No results.";
		}

		$("#tweets_data").html("<h3>Tweets found (max 100): " + tweets.length + "</h3>" + message);

		if(tweets.length !== 0)
			doClustering();
	};

	if(query.query.which === -1)
		Twitter.searchTweets(query, callback);  // Search live on twitter.
	else if(query.query.which === 4)
		Twitter.demo(query, callback);
	else
		Twitter.searchArchive(query, callback);  // Search the archieve
};

// Side panel with trending page.
function fetchTrending() {
	// Get trending topics right now in London.
	var callback = function(error, trends, response) {
		var message = trends.length + " trends<br>";
		// Start table.
		message += "<table class = 'table table-hover'>";
		message += "<thead><tr><th>Query</th><th>Tweet Volume</th></tr></thead>";
		message += "<tbody>";
		for(var i = 0; i < trends.length; ++i) {
			var trend = trends[i];
			message += "<tr><td>" + trend.getName() + "</td><td>" +
				trend.getTweetVolume() + "</td></tr>";
		}
		message += "</tbody></table>";
		$('#trending').html(message);
	}

	Twitter.getTrends("London", callback);
};
fetchTrending();