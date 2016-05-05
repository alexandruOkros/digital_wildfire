// Interface between the UI and the interface.

UI = new function() {
	// Switch context between tabs.
	this.switchTabs = function(from, to) {
		$('#' + from + '-panel-link').removeClass('is-active')
		$('#' + from + '-panel').removeClass('is-active')

		$('#' + to + '-panel').addClass('is-active')
		$('#' + to + '-panel-link').addClass('is-active')
	}

	// Switch context between tabs.
	this.switchToSearch = function() {
		$('#analysis-panel-link').removeClass('is-active')
		$('#clusters-panel-link').removeClass('is-active')

		$('#analysis-panel').removeClass('is-active')
		$('#clusters-panel').removeClass('is-active')

		$('#tweets-panel').addClass('is-active')
		$('#tweets-panel-link').addClass('is-active')
	}	

	// Get the search parameters from the UI.
	this.grabSearchQuery = function() {
		var query = {
			q: $('#search_bar').val(),
			result_type: "recent",
			count: 100,  // TODO make it 100(max 100).
		}

		// Location.
		var location = $('input[name=location_results_radio]:checked').val()
		if(location === "1")
			query.geocode = Twitter.locations.London;

		// Language.
		var language = $('input[name=language_radio]:checked').val()
		if(language === "0")
			query.lang = Twitter.languages.English;

		// Use demo data.
		query.demo = $('#switch_demo').is(':checked')

		// Parameters.
		var no_results = $('input[name=no_results_radio]:checked').val()
		if(no_results === "0") {
			params = { pages: 1 }
			query.result_type = "mixed"
		} else if(no_results === '1') {
			params = { pages: 4 }
			query.result_type = "mixed"
		} else {
			params = { pages: 10 }
			// query.result_type = "mixed"
		}

		Local.query = { query: query, params: params };  // Save.
		return Local.query;
	}

	// A search query was submitted. Show loading.
	this.showLoadingSearch = function() {
		UIDebug.showLoadingSearch()

		$('#tweets_panel_data').html("")  // Hide previous content.
		$('#clusters_panel_data').html('')
		$('#analysis_panel_data').html('')
		$('#tweets_progress_bar').show()

		UI.switchToSearch()
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

			// Hide after 60 seconds.
			setTimeout(function() { UI.dismissNewTrends() }, 60 * 1000)
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
		// UIDebug.showTweets(tweets)

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
		} else {
			var html = '<div class="small_card white_bg mdl-shadow--2dp">\
			  <div class="mdl-card__title">\
			    <h2 class="mdl-card__title-text" style = "margin: auto">No tweets.</h2>\
			  </div><div>'
		}

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
		return '<div class="mdl-card__media" style = "background-color: white"><img width = "'+width+'" \
				height = "'+height+'" src = "' + image.url + '"></div>'
	}

	this.showLoadingClusters = function() {
		$('#clusters_progress_bar').show()
		$('#clusters_panel_data').html('')

		// Show toast.
		var message = { message: 'Starting clustering ...' }
		document.querySelector('#demo-toast-example').MaterialSnackbar.showSnackbar(message)
	
	}

	this.showClusters = function(clusters, keywords) {
		// Debug.
		// UIDebug.showClusters(clusters, keywords)

		// Build the html code.
		var html = '<div style = "display: flex">'

		for(var i = 0; i < clusters.length; i++)
			html += '<div class="panel_float" style = "margin-top: 20px; margin-bottom: 20px">' +
				clusterToString(i, clusters[i], keywords) +'</div>'

		html += '</div>'
		$('#clusters_progress_bar').hide()  // Hide loading screen.
		$('#clusters_panel_data').html(html)

		// Show toast.
		var message = { message: 'Clustering finished.' }
		document.querySelector('#demo-toast-example').MaterialSnackbar.showSnackbar(message)
	

		// Create events.
		var addEvent = function(id) {
			// Add event for button.
			$('#analyze_cluster_' + id).on('click', function(event) {
				Flow.analyzeCluster(id)
			})

			// Set progress.
			var pbar = document.querySelector("#cluster_relevance"+id);
			componentHandler.upgradeElement(pbar)
			pbar.MaterialProgress.setProgress(clusters[id].relevance)
		}
		for(var i = 0; i < clusters.length; i++)
			addEvent(i)
	}

	function clusterToString(id, cluster, keywords) {
		// Start a card.
		var html = '<div class="demo-card-wide mdl-card mdl-shadow--2dp">'

		// Image.
		var image = Analysis.mostRelevantImage(cluster)
		if(image !== null)
			html += imageToString(image)
		
		html += '<div class="mdl-card__title mdl-card--border">' + 
					cluster.tweets.length + ' tweets</div> \
				<div class="mdl-card__supporting-text"> \
					<b>Cluster relevance</b> \
					<div id="cluster_relevance'+id+'" class="mdl-progress \
						mdl-js-progress" style = "margin: 5px 0px 12px 0px"></div> \
					<b>Summary</b><br>'

		for(var i = 0; i < cluster.centroid.length; i++)
			if(cluster.centroid[i] !== 0)
				html += keywords[i].text + ' ' + Math.round(cluster.centroid[i] * 100) + '%<br>'

		html += '	</div> \
				 	<div class="mdl-card__actions mdl-card--border"> \
    					<a id = "analyze_cluster_' + id + '" \
    						class="mdl-button mdl-button--colored mdl-js-button \
    						mdl-js-ripple-effect">Analyse</a> \
  					</div> \
  				</div>'

		return html
	}

	this.showLoadingAnalysis = function() {
		$('#analysis_progress_bar').show()
		$('#analysis_panel_data').html('')
	}

	this.showAnalysis = function(analysis) {
		// UIDebug.showAnalysis(analysis)

		// Grid.
		html = '<div style = "display: flex; width: 1020px; margin: auto">'
		// 1st column.
		html += 	'<div class = "panel_float">'

		// Veracity graph.
		html += veracityGraphToString()

		// Short summary.
		html += summaryToCard(analysis.summary)

		// Verified users pro.
		html += verifiedUsersToCard(analysis.verified_users.pro, 'Verified users supporting the rumour')
		html += verifiedUsersToCard(analysis.verified_users.against, 'Verified users opposing the rumour')
		
		// 2nd column.
		html += '</div><div class = "panel_float">'

		// Rate graph.
		html += rateGraphToString()

		// Popular tweets.
		if(analysis.popular_tweets.length !== 0) {
			html += sectionTitle('Popular tweets')
			var col1 = '<div style = "padding-right: 20px">'
			var col2 = '<div>'
			for(var i = 0; i < analysis.popular_tweets.length; i++)
				if(i % 2 === 0)
					col1 += '<div class = "module2">' + tweetToString(analysis.popular_tweets[i]) + '</div>'
				else
					col2 += '<div class = "module2">' + tweetToString(analysis.popular_tweets[i]) + '</div>'
			html += '<div style = "display: flex; margin-top: -20px">' + col1 + '</div>' + col2 + '</div>' + '</div>'
		}

		// Media.
		if(analysis.images.length !== 0) {
			html += sectionTitle('Images')
			var col1 = '<div style = "padding-right: 20px">'
			var col2 = '<div>'
			for(var i = 0; i < analysis.images.length; i++)
				if(i % 2 === 0)
					col1 += '<div class="module2 white_bg mdl-shadow--2dp" style = "width: 330px">' + imageToString(analysis.images[i]) + '</div>'
				else
					col2 += '<div class="module2 white_bg mdl-shadow--2dp" style = "width: 330px">' + imageToString(analysis.images[i]) + '</div>'
			html += '<div style = "display: flex; margin-top: -20px">' + col1 + '</div>' + col2 + '</div>' + '</div>'
		}

		// End.
		html += '</div></div>'

		$('#analysis_progress_bar').hide()  // Hide loading bar
		$('#analysis_panel_data').html(html)

		// Show toast.
		var message = { message: 'Analysis finished.' }
		document.querySelector('#demo-toast-example').MaterialSnackbar.showSnackbar(message)
	
		veracityGraphActivate(analysis.likelihood)  // Activate Veracity graph.
		rateGraphActivate(analysis.graph_data)  // Activate Rate graph.

		// Make them fade in.
		var allMods = $(".module2");

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

	function summaryToCard(summary) {
		if(summary.length !== 0) {
			var html = '<div class="module2 white_bg mdl-shadow--2dp" style = "width: 330px"> \
						<div class="mdl-card__title"><h3 class ="mdl-card__title-text">Short Summary</h3></div> \
					<div class = "mdl-card__supporting-text">'
			for(var i = 0; i < summary.length; i++)
				html += '<b>' + summary[i].text + '</b>, '
				html = html.slice(0, -2)  // Last comma.
			html += '</div></div>'
		} else
			var html = ''
		return html
	}

	function verifiedUsersToCard(users, title) {
		if(summary.length !== 0) {
			var html = '<div class="module2 white_bg mdl-shadow--2dp" style = "width: 330px"> \
						<div class="mdl-card__title"><h3 class ="mdl-card__title-text">'+title+'</h3></div> \
					<div class = "mdl-card__supporting-text">'
			for(var i = 0; i < users.length; i++)
				html += '<b>@' + users[i].getScreenName() + '</b>, '
			html = html.slice(0, -2)  // Last comma.
			html += '</div></div>'
		} else
			var html = ''
		return html
	} 

	function sectionTitle(title) {
		return '<div class="module2 white_bg mdl-shadow--2dp" style = "width: 680px; margin-top: 40px"> \
					<div class="mdl-card__title"><h3 class ="mdl-card__title-text">' + title + '</h3></div> \
				</div>'
	}

	function rateGraphToString() {
		return '<div class="module2 demo-card-wide mdl-card mdl-shadow--2dp" style = "width: 680px; height: 430px"> \
					<div class="mdl-card__title mdl-card--border"> \
				    	<h3 class="mdl-card__title-text">Tweets rate</h3> \
					</div> \
					<div class="mdl-card__supporting-text mdl-card--border" style = "width: 648px; height: 430px"> \
						<canvas id="rateGraph" width="40" height="20"></canvas> \
					</div> \
				</div>'
	}

	function rateGraphActivate(data) {
		var max = 200
		data.pro = data.pro.map(function(value) {
			if(value > max)
				return max
			else
				return value
		})
		data.against = data.against.map(function(value) {
			if(value > max)
				return max
			else
				return value
		})
		labels = new Array(data.pro.length).fill('0')
		// console.log(data)
		// Create the chart.
		var ctx = document.getElementById('rateGraph').getContext('2d');
		var data = {
			labels: data.labels,
			datasets: [
				{ label: 'For',
				  data: data.pro,
		          backgroundColor: 'rgba(17, 131, 132, 0.5)',
            	  lineTension: 0.5,
		          fill: true, 
		      	},
				{ label: 'Against',
				  data: data.against,
		          backgroundColor: 'rgba(255, 99, 132, 0.5)',
            	  lineTension: 0.5,
		          fill: true, 
		      	}
			]
		}
		var options = {
			// legend: { display: false }
            // scales: { yAxes: [{ type: 'logarithmic', id: "y-axis-0"}] }
		}
		var myLineChart = new Chart(ctx, {
		    type: 'line',
		    data: data,
		    options: options
		});
	}

	function veracityGraphToString() {
		var html = '<div class="module2 demo-card-wide mdl-card mdl-shadow--2dp"> \
						<div class="mdl-card__title mdl-card--border"> \
						    <h3 class="mdl-card__title-text">Veracity</h3> \
						</div> \
  						<div class="mdl-card__supporting-text mdl-card--border" style = "width: 298px; height: 298px"> \
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
		          backgroundColor: ["#FF6384", "#fce8ef"] }
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
		UI.switchTabs('tweets', 'analysis')
		var clusters = [{ tweets: tweets, 
			centroid: [0.91, 0.81, 0.09, 0.6, 0.5], 
		   relevance: 80 }]
		var keywords =
			 [{ text: 'Google', relevance: 1 },
			 { text: 'Telegram', relevance: 1 },
			 { text: 'Google buyout rumour', relevance: 1 },
			 { text: 'Telegram owner', relevance: 1 },
			 { text: 'Telegram Joel', relevance: 1 }
			]
		Local.clusters = clusters
		// UI.showClusters(, )


		Flow.analyzeCluster(0)
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
		var message = "";

		$("#analysis_data").html(message);
	}
}