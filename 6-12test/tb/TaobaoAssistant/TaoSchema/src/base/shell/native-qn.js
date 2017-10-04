
define(function(require, exports, module){
	/**
	 * 前后端调用中转服务 
	 *
	 * 调用标准数据格式：
	 * method "methodName"
	 * params JSON
	 * callback [可选]，转化为uuid暴露到window域下
	 *
	 */
	exports.invoke = function(json){
		json.tag = 'invoke';
		json.from = {
			"iframe": "AS_ITEM_EDIT",
			"module": "schema"
		};

		if(window.parent !== window){ // 当为顶层iframe时，禁止给自己发送消息
			window.parent.postMessage(JSON.stringify(json), '*');	
		}
	};

	var qnNative = window.parent.schema;
	exports.invoke = function(obj){
		qnNative.invoke(obj);
	};

	exports.trigger = function(){
		var args = Array.prototype.slice.call(arguments);
		qnNative.trigger.notify(qnNative, args);
	};

	/**
	 * 创建UUID
	 */
	var S4 = function(){
	   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	};

	var guid = function(){
	   return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
	};

	exports.createUUID = function(){
		return guid();
	};
	//
});