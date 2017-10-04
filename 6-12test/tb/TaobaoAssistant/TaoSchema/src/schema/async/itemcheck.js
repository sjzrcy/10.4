/*
{
	action: "itemcheck"
}

特别说明：该异步可支持所有单项值的检查
*/

define(function(require, exports, module){
	var Async = require('src/schema/async/base');
	var Imp = Async.extend({
		initialize: function(){
			Async.prototype.initialize.apply(this, arguments);
		},

		doResponse: function(response){
			if(response.result){
				if(_.isObject(response.data)){
					this.cb(response.data.error);
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