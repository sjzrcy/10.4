/*
	action: "updateQualification"
}
*/

define(function(require, exports, module){
	var Async = require('src/schema/async/base');
	var Imp = Async.extend({
		initialize: function(){
			Async.prototype.initialize.apply(this, arguments);
		},

		doResponse: function(response){
			if(_.isObject(response) && response.result){
				// render
				if(_.isObject(response.data) && _.isArray(response.data.layout)){
					if(_.isFunction(this.updateCb)){
						this.updateCb(response.data.layout);	
					}else{
						alert('未设置商品资质异步render的回调！');
					}
				}else{
					as.util.showErrorTip('商品资质schema数据异常');	
				}

				// fill
				if(_.isObject(response.data) && _.isArray(response.data.async) && response.data.async.length > 0){
					if(_.isFunction(this.replaceFillCb)){
						this.replaceFillCb(response.data.async[0]);	
					}else{
						alert('未设置商品资质异步更新fill的回调！');
					}
				}
			}else{
				var text = _.isObject(response)? response.msg: '获取商品资质失败';
				as.util.showErrorTip(text);
			}
		},

		setCb: function(updateCb, replaceFillCb){
			this.updateCb = updateCb;
			this.replaceFillCb = replaceFillCb;
		}
	});

	module.exports = Imp;
});