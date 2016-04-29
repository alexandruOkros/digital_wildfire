//
// Simple interface for Socket.io.
//
Socket = new function() {
	var socket = io();
	var connection_id = 0;  // Generate unique id for connections.

	// Return unique id to be used for new connections.
	this.getNewConnectionId = function() {
		var local = connection_id;
		connection_id += 1;
		return local;
	}

	this.emit = function(label, data) {
		socket.emit(label, data);
	}

	this.on = function(label, callback) {
		socket.on(label, callback);
	}
}