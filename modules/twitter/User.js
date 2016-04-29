// The User type:
//
// Receive an object of type User, but without methods and extend it with the
// appropriate methods, returning the resulted object.
//
// function toUser(user: User): User
function toUser(user) {

	// Extending the object with methods.

	//
	// id    (used for identifying tweets).
	//
	// hasId(): Boolean
	user.hasId = function() {
		return (user.hasOwnProperty('id') && user.id !== null && user.id !== 0);
	}
	// getId(): Int
	user.getId = function() {
		return user.id;
	}


	//
	// verified    (if the user is verified).
	//
	// isVerified(): Boolean
	user.isVerified = function() {
		return (user.hasOwnProperty('verified') && user.verified !== null
			&& user.verified);
	}


	//
	// name    ("real" name of user - not that useful).
	//
	// hasName(): Boolean
	user.hasName = function() {
		return (user.hasOwnProperty('name') && user.name !== null
			&& user.name !== "");
	}
	// getName(): String
	user.getName = function() {
		return user.name;
	}


	//
	// screen_name    (screen name of user i.e. @username).
	//
	// hasScreenName(): Boolean
	user.hasScreenName = function() {
		return (user.hasOwnProperty('screen_name') && user.screen_name !== null
			&& user.screen_name !== "");
	}
	// getScreenName(): String
	user.getScreenName = function() {
		return user.screen_name;
	}


	//
	// location    (location of user - not verified, and not that useful).
	//
	// hasLocation(): Boolean
	user.hasLocation = function() {
		return (user.hasOwnProperty('location') && user.location !== null
			&& user.location !== "");
	}
	// getLocation(): String
	user.getLocation = function() {
		return user.location;
	}


	//
	// description    (short description of the account).
	//
	// hasDescription(): Boolean
	user.hasDescription = function() {
		return (user.hasOwnProperty('description') && user.description !== null
			&& user.description !== "");
	}
	// getDescription(): String
	user.getDescription = function() {
		return user.description;
	}


	//
	// followers_count    (number of followers).
	//
	// hasFollowersCount(): Boolean
	user.hasFollowersCount = function() {
		return (user.hasOwnProperty('followers_count') &&
			user.followers_count !== null);
	}
	// getFollowersCount(): Int
	user.getFollowersCount = function() {
		return user.followers_count;
	}


	//
	// friends_count    (number of friends).
	//
	// hasFriendsCount(): Boolean
	user.hasFriendsCount = function() {
		return (user.hasOwnProperty('friends_count') &&
			user.friends_count !== null);
	}
	// getFriendsCount(): Int
	user.getFriendsCount = function() {
		return user.friends_count;
	}


	//
	// listed_count    (number of lists in which the user is included).
	//
	// hasListedCount(): Boolean
	user.hasListedCount = function() {
		return (user.hasOwnProperty('listed_count') &&
			user.listed_count !== null);
	}
	// getListedCount(): Int
	user.getListedCount = function() {
		return user.listed_count;
	}


	//
	// favourites_count    (number of users who added this user to favorites).
	//
	// hasFavoriteCount(): Boolean
	user.hasFavoriteCount = function() {
		return (user.hasOwnProperty('favourites_count') &&
			user.favourites_count !== null);
	}
	// getFavoriteCount(): Int
	user.getFavoriteCount = function() {
		return user.favourites_count;
	}


	//
	// created_at     (creation date and time of account).
	//
	// hasCreatedAt(): Boolean
	user.hasCreatedAt = function() {
		return (user.hasOwnProperty('created_at') && user.created_at !== null
			&& user.created_at !== "");
	}
	// Convert user.created_at to a time object.
	// Example: user.created_at = "Mon Mar 14 12:55:01 +0000 2016".
	// TODO: Timezone?
	if(user.hasCreatedAt()) {
		// Only create a date object if the .created_at is set.
		var year = user.created_at.substr(26, 4);
		var month_string = user.created_at.substr(4, 3);
		var month = "JanFebMarAprMayJunJulAugSepOctNovDec"
			.indexOf(month_string) / 3 + 1;
		var day = user.created_at.substr(8, 2);
		var hours = user.created_at.substr(11, 2);
		var minutes = user.created_at.substr(14, 2);
		var seconds = user.created_at.substr(17, 2);
		var milliseconds = 0;  // Cannot be retrieved - also don't care.

		// Create the date object.
		var created_at_date = new Date(year, month, day, hours, minutes,
			seconds, milliseconds);
		// console.log(year + " " + month + " " + day + " " + hours + " " + 
			// minutes + " " + seconds + " " + milliseconds);
	}
	// getCreatedAt(): Date
	user.getCreatedAt = function() {
		return created_at_date;
	}





	// TODO: other fields for a user.
	// 
	// Other fields of a user that might be useful: statuses_count, 
	// profile_picture.

	return user;
}
