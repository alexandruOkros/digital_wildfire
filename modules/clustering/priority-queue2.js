
function PriorityQueue(argument) {
	var pri_queue = new Array();

	this.queue = function(item) {
		pri_queue.push(item);
	};

	this.dequeue = function() {
		var index = 0;

		for(var i = 1; i < pri_queue.length; i++)
			if(argument.comparator(pri_queue[index], pri_queue[i]) > 0)
				index = i;

		var result = pri_queue[index];
		if(index === pri_queue.length - 1)
			pri_queue.pop();
		else
			pri_queue[index] = pri_queue.pop();

		return result;
	};
}