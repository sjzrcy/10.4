/**
 * 发布助手
 * IN
 * 错误信息入口：updateErrors
 * 错误信息出口(只出不进)：field.once('hasNoError', this.onHasNoError, this)
 * item就是field
 * 
 */

define(function(require, exports, module){
	//
	var Model = Backbone.Model.extend({
		events: {
			'updateErrors': undefined, // 信息重置
			'clearErrors': undefined, // 清除所有错误
			'itemRemoved': undefined, // 移除某错误
		},

		initialize: function(){
			this.set('items', []);
			this.set('height', 0);
		},

		updateErrors: function(allItems){
			//
			var me = this;

			// 断开之前的事件连接
			var items = this.get('items');
			_.each(items, function(item){
				item.off('noError', me.onNoError, me);
			});

			// 数组清空
			items.length = 0;

			// 重新设置错误数据并重绘 
			_.each(allItems, function(item){
				if(item.hasError()){
					item.once('noError', me.onNoError, me);
					items.push(item);
				}
			});

			// 广播重置信号
			this.trigger('updateErrors');
		},

		// 验证成功，清除所有错误
		clearErrors: function(){
			this.set('items', []);
			this.trigger('clearErrors');
		},	

		hasError: function(){
			return (this.get('items').length > 0);
		},

		setHeight: function(height){
			var last = this.height();
			if(_.isNumber(height) && last !== height){
				this.set('height', height);
				this.trigger('heightChanged');
			}
		},

		height: function(){
			var height = this.get('height');
			if(!_.isNumber(height)){
				height = 0;
			}
			return height;
		},

		onNoError: function(id){
			var items = this.get('items');
			var findIndex;
			_.find(items, function(item, index){
				if(item.id === id){
					findIndex = index;
					return true;
				}
			});

			if(findIndex !== undefined){
				items.splice(findIndex, 1);
				this.trigger('itemRemoved', id);
			}
		}
	});

	// 单实例
	module.exports = (new Model({}));
});