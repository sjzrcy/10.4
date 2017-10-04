/*
{
	action: "fillqualification"
}
*/

define(function(require, exports, module){
	var Async = require('src/schema/async/base');
	var Imp = Async.extend({
		initialize: function(){
			Async.prototype.initialize.apply(this, arguments);
		},

		doResponse: function(response){
			if(response.result && _.isObject(response.data)){
				var kvs = response.data.fields;
				if( _.isFunction(this.cb) && _.isArray(kvs) && kvs.length > 0){
					this.cb(kvs);
				}
			}else{
				as.util.showErrorTip(response.msg);
			}
		},

		setCb: function(cb){
			this.cb = cb;
		}
	});

	module.exports = Imp;
});