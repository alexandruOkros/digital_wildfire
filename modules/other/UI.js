// Interface between the UI and the interface.

UI = new function() {
	// Switch context between tabs.
	this.switchTabs = function(from, to) {
		$('#' + to + '-panel-link').addClass('is-active')
		$('#' + from + '-panel-link').removeClass('is-active')

		$('#' + from + '-panel').removeClass('is-active')
		$('#' + to + '-panel').addClass('is-active')
	}	

	// Get the search parameters from the UI.
	this.grabSearchQuery = function() {
		var query = {
			q: $('#search_bar').val(),
			result_type: "recent",
			count: 100,  // TODO make it 100(max 100).
		}

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
			params = { pages: 3 };


		Local.query = { query: query, params: params };  // Save.
		return Local.query;
	}

	// A search query was submitted. Show loading.
	this.showLoadingSearch = function() {
		UIDebug.showLoadingSearch()

		$('#tweets_panel_data').html("")  // Hide previous content.
		$('#tweets_progress_bar').show()
	}

	this.showLoadingTrends = function() {
		$('#trending_panel').html('');  // Hide previous content.
		$('#trends_progress_bar').show()
	}

	this.showTrends = function(trends) {
		var new_trends = 0  // Count them.
		// Start the table.
		var html = '<table id = "trends_table" class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">'
		html += "<thead><tr><th>Phrase</th><th class = 'mdl-data-table__header--sorted-descending'>Tweet Volume</th></tr></thead>";
		html += "<tbody>";

		for(var i = 0; i < trends.length; ++i) {
			var data = trendToString(trends[i])
			html += data.html
			if(data.mark === true)
				new_trends += 1
		}
		 
		html += "</tbody></table>";

		// If there are new trends alert the user.
		if(new_trends !== 0 /* && Local.trends.length !== 0*/) {
			// Show toast.
			var message = { message: 'There are new trending topics in London.' }
    		document.querySelector('#demo-toast-example').MaterialSnackbar.showSnackbar(message)
		
    		// Update count.
    		$('#trending_badge').html('<span class="mdl-badge" data-badge="'+new_trends+'"></span>')
		
			// Show button.
			$('#trending_button').show()
		}

		$('#trends_progress_bar').hide()  // Hide loading bar.
		$('#trending_panel').html(html);
	}

	this.dismissNewTrends = function() {
		// Hide count.
		$('#trending_badge').html('')
	
		// Hide button.
		$('#trending_button').hide()

		// Unbold.
		var allMods = $(".bold_trending");

		allMods.each(function(i, el) {
		  var el = $(el);
		  el.removeClass('bold_trending')
		});
	}

	function trendToString(trend) {
		// Search in the old trends.
		var findOldTrend = function(trend) {
			for(var i = 0; i < Local.trends.length; i++)
				if(Local.trends[i].getName() === trend.getName())
					return false
			return true
		}

		// Prettify
		var transformToText = function(tweet_volume) {
			if(tweet_volume > 100000)
				return '<span class = "mdl-color-text--red-300"><b>high</b></span>'
			else if(tweet_volume > 50000)
				return '<span class = "mdl-color-text--orange-300"><b>medium</b></span>'
			else
				return '<span class = "mdl-color-text--green-300"><b>low</b></span>'
		}

		var mark = findOldTrend(trend)
		if(mark === true) var name = '<span class = "bold_trending">' + trend.getName() + '</span>'
		else var name = trend.getName()

		return { html: "<tr><td class = 'mdl-data-table__cell--non-numeric'>" + name + "</td><td>" +
			transformToText(trend.getTweetVolume()) + "</td></tr>", mark: mark }
	}

	this.showTweets = function(tweets) {
		UIDebug.showTweets(tweets)

		if(tweets.length !== 0) {
			// Start grid
			var html = '<div class = "mdl-grid">'

			var col1 = '<div style = "float: left; padding: 10px">'
			var col2 = '<div style = "float: left; padding: 10px">'
			for(var i = 0; i < tweets.length && i < 100; i++)
				if(i % 2 === 0)
					col1 += '<div class="module ">' +
						tweetToString(tweets[i]) +'</div>'
				else
					col2 += '<div class="module ">' +
						tweetToString(tweets[i]) +'</div>'

			html += col1 + '</div>' + col2 + '</div></div>'
		} else
			var html = "No tweets found."

		$('#tweets_progress_bar').hide()  // Hide progress bar.
		$('#tweets_panel_data').html(html)


		var allMods = $(".module");

		allMods.each(function(i, el) {
		  var el = $(el);
		  if (el.visible(true)) {
		    el.addClass("already-visible"); 
		  } 
		});

		$('#main_content').scroll(function(event) {
		  allMods.each(function(i, el) {
		    var el = $(el);
		    if (el.visible(true)) {
		      el.addClass("come-in"); 
		    } 
		  });
		});
	}

	function tweetToString(tweet) {
		// Check for image.
		if(tweet.hasMedia()) {
			var image = tweet.getMedia()
			var has_image = true
			var costum_height = ''
		} else {
			var has_image = false
			var costum_height = '; position: absolute; bottom: 0px'
		}

		// Start a card.
		var html = '<div class="mdl-card mdl-shadow--2dp">'

		// Picture.
		if(has_image)
			html += imageToString(image)

		// Username and date.
		html += '<div class="mdl-card__supporting-text"><div style = \
			"margin-bottom: 4px"><b>@' +
			tweet.user.getScreenName() + '</b><span style ="float: right">' + 
			tweet.getCreatedAtString() +'</span></div>'
  		
		// Tweet text.
  		html += tweet.getText() + '</div>'

  		html += '<div class="mdl-card__actions mdl-card--border" style = "padding: 16px'+costum_height+'">'
  		html += '<span class="mdl-badge mdl-badge--no-background" data-badge="'+tweet.getRetweetCount()+'">retweeted</span>'
   		html += '<span class="mdl-badge mdl-badge--no-background" style = "margin-left: 20px" data-badge="'+tweet.getFavoriteCount()+'">favorited</span>'
   		
		html += '</div></div>'

		return html
	}

	function imageToString(image) {
		var width = 330
		var height = image.height * image.width / width
		return '<div class="mdl-card__media"><img width = "'+width+'" \
				height = "'+height+'" src = "' + image.url + '"></div>'
	}

	this.showLoadingClusters = function() {
		$('#clusters_progress_bar').show()
	}

	this.showClusters = function(clusters, keywords) {
		// Debug.
		UIDebug.showClusters(clusters, keywords)

		// Build the html code.
		var html = '<div class="mdl-grid">'

		for(var i = 0; i < clusters.length; i++)
			html += '<div class="mdl-cell mdl-cell--12-col">' +
				clusterToString(i, clusters[i], keywords) +'</div>'

		html += '</div>'
		$('#clusters_progress_bar').hide()  // Hide loading screen.
		$('#clusters_panel_data').html(html)

		// Create events.
		var addEvent = function(id) {
			$('#analyze_cluster_' + id).on('click', function(event) {
				Flow.analyzeCluster(id)
			})
		}
		for(var i = 0; i < clusters.length; i++)
			addEvent(i)
	}

	function clusterToString(id, cluster, keywords) {
		// Find the most relevant picture.
		var max = -1
		var image = null
		for(var i = 0; i < cluster.tweets.length; i++)
			if(cluster.tweets[i].hasMedia() && (max === -1 || cluster.tweets[i].getRetweetCount() > max)) {
				max = cluster.tweets[i].getRetweetCount()
				image = cluster.tweets[i].getMedia()
			}

		// Start a card.
		var html = '<div class="demo-card-wide mdl-card mdl-shadow--2dp">'

		// Image.
		if(max !== -1)
			html += imageToString(image)
		
		html += '<div class="mdl-card__supporting-text"> \
			<br>Cluster #' + id + " has " + cluster.tweets.length + 
			" tweets.<br>";

		for(var i = 0; i < cluster.centroid.length; i++)
			if(cluster.centroid[i] !== 0)
				html += keywords[i].text + ' (' + Math.round(cluster.centroid[i] * 100) / 100 + ')<br>'

		html += '	</div> \
				 	<div class="mdl-card__actions mdl-card--border"> \
    					<a id = "analyze_cluster_' + id + '" \
    						class="mdl-button mdl-button--colored mdl-js-button \
    						mdl-js-ripple-effect">Analyse</a> \
       						<i class="material-icons" style = "float: right">cached</i> \
  					</div> \
  				</div>'

		return html
	}

	this.showAnalysis = function(analysis) {
		UIDebug.showAnalysis(analysis)

		console.log(analysis)

		var br = '<br>'

		var html = 'Questions: ' + analysis.questions + br
		html += 'Positive: ' + analysis.positive + br
		html += 'Negative: ' + analysis.negative + br
		html += 'Rumour likelihood: ' + analysis.likelihood + br
		html += veracityGraphToString()

		/*
		for(var i = 0; i < analysis.keywords.length; i++)
			html += analysis.keywords[i].text + ' (' + analysis.keywords[i].relevance + ')' + br
		*/

		$('#analysis_panel_data').html(html)
		veracityGraphActivate(analysis.likelihood)
	}

	function veracityGraphToString() {
		var html = '<div class="demo-card-wide mdl-card mdl-shadow--2dp" style = "width: 232px"> \
						<div class="mdl-card__title mdl-card--border"> \
						    <h3 class="mdl-card__title-text">Veracity</h3> \
						</div> \
  						<div class="mdl-card__supporting-text mdl-card--border" style = "width: 200px; height: 200px"> \
    						<canvas id="veracityGraph" width="20" height="20"></canvas> \
  						</div> \
  					</div>'
  		return html
	}

	function veracityGraphActivate(positive_percent) {
		positive_percent = Math.round(positive_percent * 10) / 10
		var negative_percent = Math.round((100 - positive_percent) * 10) / 10

		// Create the chart.
		var ctx = document.getElementById('veracityGraph').getContext('2d');
		var data = {
			labels: ['True', 'False'],
			datasets: [
				{ data: [positive_percent, negative_percent],
		          backgroundColor: ["#FF6384", "#fad1df"] }
			]
		}
		var options = {
			legend: { display: false }
		}
		var myDoughnutChart = new Chart(ctx, {
		    type: 'doughnut',
		    data: data,
			  animation:{
			      animateScale: true,
			      animateRotate: true
			  },
		    options: options
		})
	}

	this.testAnalyze = function() {
		
		var analysis = {
			positive: 116,
			negative: 1543,
			likelihood: 83.1
		}

		UI.switchTabs('tweets', 'analysis')
		UI.showAnalysis(analysis)
	}

	this.testCluster = function(tweets) {
		UI.switchTabs('tweets', 'clusters')
		UI.showClusters(
			[{ tweets: tweets, centroid: [0.91, 0.81, 0.09, 0.6, 0.5]}], 
			[{ text: 'Google', relevance: 1 },
			 { text: 'Telegram', relevance: 1 },
			 { text: 'Google buyout rumour', relevance: 1 },
			 { text: 'Telegram owner', relevance: 1 },
			 { text: 'Telegram Joel', relevance: 1 }
			])
	}
}

UIDebug = new function() {
	// A search query was submitted. Show loading.
	this.showLoadingSearch = function() {
		$("#tweets_data").html("Loading ...");
		$("#clusters_data").html("");
		$("#analysis_data").html("");
	}

	this.showTweets = function(tweets) {
		return
		var html = "";

		if(tweets.length !== 0) {
			html += "<a href='#demoresults' data-toggle='collapse'>show tweets</a>";
			html += "<div id ='demoresults' class = 'collapse'>";
				
			for(var i = 0; i < tweets.length && i < 20; ++i)
				html += tweets[i].toString();

			html += "</div>";
		} else {
			html = "No results.";
		}

		$("#tweets_data").html("<h3>Tweets found (max 100): " + tweets.length + "</h3>" + html);
	}

	this.showClusters = function(clusters, words) {
		return
		var count = 0;
		var message = "";
		var br = "<br>";

		if(clusters.length > 0) {

			message += "<h4>Entities used for clustering (with relevance for the tweets): </h4>" + br;
			message += "<a href='#demoz0' data-toggle='collapse'>keywords</a>";
			message += "<div id ='demoz0' class = 'collapse'>";
			message += "<ul class ='list-group'>";

			for(var i = 0; i < words.length; i++)
				message += "<li class = 'list-group-item'>" + words[i].text + " <b>(" + words[i].relevance +  ")</b></li>";

			message += "</div>";
			message += "</ul>";
			message += br + br;

			for(var i = 0; i < clusters.length; ++i)
				if(clusters[i].tweets.length !== 0) {
					count = count + 1;

					message += "<h4>Cluster #" + count + " has " + clusters[i].tweets.length + " tweets.</h4>";

					// Keywords.
					message += "<a href='#demo2"+i+"' data-toggle='collapse'>centroid</a>";
					message += "<div id ='demo2"+i+"' class = 'collapse'>";
					message += "<ul class ='list-group'>";
					for(var j = 0; j < words.length; j++)
						if(clusters[i].centroid[j] !== 0)
						message += "<li class = 'list-group-item'>" + words[j].text + " <b>(" + clusters[i].centroid[j] +  ")</b></li>";
					message += "</ul>";
					message += "</div>";

					message += "<br>";
					// Tweets.
					message += "<a href='#demo"+i+"' data-toggle='collapse'>tweets</a>";
					message += "<div id ='demo"+i+"' class = 'collapse'>";
					message += "<ul class ='list-group'>";

					for(var j = 0; j < clusters[i].tweets.length && j < 100; j++)
						message += "<li class = 'list-group-item'>" + clusters[i].tweets[j].getText() + "</li>";

					message += "</ul>";
					message += "</div>";
				}
		} else
			message = "No clusters for data.";

		$("#clusters_data").html("<h3>Clusters: " + count + "</h3>" + message);
	}

	this.showAnalysis = function(data) {
		return
		var message = "";

		$("#analysis_data").html(message);
	}
}