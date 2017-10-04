/**
 * tab控件
 * {tab:, id:, title:,}
 */

define(function(require, exports, module){
	//
	var TabItemModel = Backbone.Model.extend({
		initialize: function(){

		},

		active: function(){
			var parent = this.get('parent');
			parent.setCurrent(this.get('id'));

			// 标记插件被激活 
			as.popPlugin = true;
		}
	});

	//
	module.exports = TabItemModel;
});