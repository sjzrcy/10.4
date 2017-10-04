define(function(require, exports, module){
	var native;
	if(window.asHost === 'qn'){
		native = require('src/base/shell/native-qn');
	}else{
		native = require('src/base/shell/native');
	}

	var queue = [];
	var isRunning = false;
	var timer;

	var runOneTask = function(){
		if(queue.length > 0){
			var task = queue.pop();
			native.invoke(task);
		}else{
			clearInterval(timer);
			timer = undefined;
			isRunning = false;
		}
	};

	var start = function(){
		if(!isRunning){
			isRunning = true;
			runOneTask();
			timer = setInterval(runOneTask, 200);
		}
	};

	exports.push = function(task){
		queue.push(task);
		start();
	};
});