/**
 * 按键消息统一通过key进行转发
 * extra{
	ctrl:
	alt:
	shift:
 }
 */

define(function(require, exports, module){
	// 按键配置，str => code，不区分大小写，后面需要加新的按键，自己去捕捉吧
	var config = {
		'0':48,
		'9':57,
		'A':65,
		'S':83, 
		'Z':90,
		'F1':112,
		'F2': 113,
		'F12':123,
		',':188,
	};

	// 前置检查
	var pre = {
		alt: 'altKey',
		ctrl: 'ctrlKey',
		shift: 'shiftKey'
	};
	var precheck = function(extra, e){
		var isOk = true;
		if(!_.isObject(extra)){
			return isOk;
		}

		_.each(extra, function(value, key){
			if(value === true && isOk === true){
				var eventKey = pre[key];
				if(_.isString(eventKey) && !e[eventKey]){
					isOk = false;
				}
			}
		});

		return isOk;
	};

	// {keyCode: []}
	var upHandlers = {};
	var listenKeyUp = function(key, cb, extra){
		if(!_.isString(key) || !_.isFunction(cb)){
			return;
		}

		key = key.toUpperCase();
		var code = config[key];
		if(_.isUndefined(code)){
			return;
		}

		var handlers = upHandlers[code];
		if(!_.isArray(handlers)){
			handlers = [];
			upHandlers[code] = handlers;
		}

		handlers.push({handler: cb, extra: extra});
	};

	// e为event对象
	var routeKeyUp = function(e){
		var handlers = upHandlers[e.which];
		if(_.isArray(handlers)){
			_.each(handlers, function(wrap){
				var extra = wrap.extra;
				if(precheck(extra, e)){
					wrap.handler();
				}
			});
		}
	};

	// 初始化
	var init = function(){
		// 响应按键UP
		$('body').keyup(function(){
			routeKeyUp(event);
		});
	};

	// 监听up按键
	exports.init = init;
	exports.listenKeyUp = listenKeyUp;
});