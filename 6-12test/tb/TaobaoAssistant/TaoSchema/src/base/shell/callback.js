/**
 * shell的callback管理
 * 切换宝贝，切换类目时，需要使之前的回调全部失效
 */
define(function(require, exports, module){
	var callbacks = [];
	var emptyFunction = function(){
		log('emptyFunction', arguments);
	};

	// 注册回调
	exports.register = function(callback){
		callbacks.push(callback);
	};

	// 清除回调
	exports.clear = function(){
		for(var i = 0; i < callbacks.length; ++i){
			var callback = callbacks[i];
			if(_.isFunction(window[callback])){
				window[callback] = emptyFunction;
			}
		}
		callbacks = [];
	};
});