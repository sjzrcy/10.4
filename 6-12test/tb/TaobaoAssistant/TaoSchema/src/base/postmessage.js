
define(function(require, exports, module){
	//
	window.addEventListener('message', function(e){
		log('OnPostMessage', JSON.stringify(e.data));
		var data = e.data;
		
		// 尺码模板
		if(_.isObject(data)){
			var method = data.method;
			if(_.isString(method) && _.isFunction(window[method])){
				window[method](data.params);
				return;		
			}	
		}

		// 直邮协议
		if(_.isString(data)){
			try{
				data = JSON.parse(data);
				var callback = data.callback;
				if(_.isString(callback) && _.isFunction(window[callback])){
					window[callback](data.data);
					return;
				}
			}catch(e){
				error('海外直邮通信传入非法json字符串');
				error(e.data);
			}
		}

		warn('收到未知PostMessage!', e.origin, e.data);
	});
});