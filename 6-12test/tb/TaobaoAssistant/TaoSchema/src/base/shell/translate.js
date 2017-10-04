
define(function(require, exports, module){
	// 执行回调
	var doCallback = function(cb, args){
		switch(args.length){
			case 0: {
				cb();
				break;
			}

			case 1: {
				cb(args[0]);
				break;
			}

			case 2: {
				cb(args[0], args[1]);
				break;
			}

			case 3: {
				cb(args[0], args[1], args[2]);
				break;
			}

			case 4: {
				cb(args[0], args[1], args[2], args[3]);
				break;
			}

			case 5: {
				cb(args[0], args[1], args[2], args[3], args[4]);
				break;
			}

			default: {
				alert('回调函数参数个数超过限制，最多为5，当前为：' + args.length);
			}
		}
	};

	/**
	 * 当前还未失效的回调集合，可通过该对象查询
	 */
	window.__tbaCbs__ = {};

	//
	var INVALID_TIME = 60 * 60 * 1000;
	var PREFIX = "C62018D1DC074199ACCAE8452612DF72";
	var index = 0;

	/**
	 * 对前端任意函数进行具名转换，生成全局唯一id，暴露到window域下
	 * 格式:[%UUID% + 'FUN' + %INDEX%]
	 */
	var translate = function(cb, forbidAutoRemove){
		if(!_.isFunction(cb)){
			return;
		}

		var remove = function(name){
			delete window[name];
			delete window.__tbaCbs__[name];
		};

		var name = "FUN" + (++index);
		name = PREFIX + name;

		window.__tbaCbs__[name] = cb;
		window[name] = function(){
			doCallback(cb, arguments);
			if(forbidAutoRemove !== true){
				remove(name);
				clearTimeout(timerId);
			}else{
				// 等待其自动自动清除
			}
		};

		var timerId = setTimeout(function(){
			remove(name);
		}, INVALID_TIME);

		return name;
	};

	module.exports = translate;
});