/**
 * 分析后端接口
 */
define(function(require, exports, module){
	// 统计后端api响应时间时间
	exports.time = function(identity, cb, extra){
		var start = new Date();
		return function(str){
			var cost = (new Date()) - start;
			as.shell.deserialize(identity, function(value){
				if(!_.isArray(value)){
					value = [];
				}

				value.push({'time': (new Date()).toLocaleString(), 'cost': cost});
				as.shell.serialize(identity, value);
			});

			if(_.isObject(extra)){
				extra = JSON.stringify(extra);
			}

			warn(identity, 'cost >>', cost, 'ms', extra);
			warn(str);
			
			cb(str);
		};
	};

	// 自动反序列化
	exports.deserialize = function(key, cb){
		return function(jsonStr){
			var value;
			try{
				value = JSON.parse(jsonStr);
			}catch(e){
				value = '';
				log(key, '>> deserialize invalid json');
			}

			cb(value);
		};
	};
});