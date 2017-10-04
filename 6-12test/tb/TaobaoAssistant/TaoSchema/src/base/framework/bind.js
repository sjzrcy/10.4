/**
 *
 */

 define(function(require, exports, module){
	// 绑定函数
 	var bind = function(api, cb, thisObj){
 		if(typeof(api) !== 'string' || api === ''){
 			alert('提供给后端的api名字只能是字符串且不能为空');
 			return;
 		}

 		if(window[api] !== undefined){
 			alert('与window域下同名属性冲突或者重复绑定 >> ' + api);
 			return;
 		}

 		if(typeof(cb) !== 'function'){
 			alert('bind必须提供一个函数');
 			return;
 		}

		// bind  		
 		window[api] = function(){
 			if(_.isObject(thisObj)){ // 合法对象
 				return cb.apply(thisObj, arguments);
 			}else{// 如果没有设置就使用window作为this
 				return cb.apply(window, arguments);
 			}
 		};
 	};

 	//
 	module.exports = bind;
 });