/*
{
	action: "checkcolor"
}
*/

define(function(require, exports, module){
	var Async = require('src/schema/async/base');
	var Imp = Async.extend({
		initialize: function(){
			Async.prototype.initialize.apply(this, arguments);
		},

		// 每次发起请求前由外面设置
		setText: function(text){
			this.queryText = text;
		},

		getText: function(){
			return this.queryText;
		},

		doParams: function(params){
			var paramList = this.async.params;
			if(paramList.text != undefined){
				params['text'] = this.getText();
			}

			return params;
		},

		doResponse: function(response){
			if(_.isFunction(this.cb) && _.isObject(response)){
				if(response.result && _.isObject(response.data)){
					this.cb(response.data.checkResult);
				}
			}

			this.cb = undefined;
		},

		doException: function(){
			this.cb = undefined;
		},

		doCheck: function(text, cb){
			if(this.cb){
				return;
			}

			this.setText(text);
			this.cb = cb;
			this.doRequest();
		}
	});

	//
	module.exports = Imp;
});
