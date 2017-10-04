/*
{
	action: "querycolor"
}
*/

define(function(require, exports, module){
	var Async = require('src/schema/async/base');
	var Imp = Async.extend({
		initialize: function(){
			Async.prototype.initialize.apply(this, arguments);
			this.queue = [];
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
			if(paramList.text !== undefined){
				params['text'] = this.getText();
			}

			return params;
		},

		doResponse: function(response){
			if(_.isFunction(this.cb) && _.isObject(response)){
				var options = [];
				if(response.result && _.isObject(response.data) && _.isArray(response.data.suggestResult)){
					options = response.data.suggestResult;
				}

				this.cb(options);
			}

			this.cb = undefined;
			this.doQueue();
		},

		doException: function(){
			this.cb = undefined;
			this.doQueue();
		},

		doQuery: function(text, cb){
			if(this.cb){ // 正在查询中，排队
				this.queue.push({
					text: text,
					cb: cb
				});
				return;
			};

			this.setText(text);
			this.cb = cb;
			this.doRequest();
		},

		doQueue: function(){
			if(this.queue.length > 0){
				var request = this.queue[this.queue.length - 1];
				this.doQuery(request.text, request.cb);
				this.queue = [];
			}
		}     
	});

	//
	module.exports = Imp;
});

