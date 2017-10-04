/**
 * 基本信息 - 左侧
 *
 * 类目选择
 * 基本信息 * N
 * 价格库存
 *
 * in：
 * category - 类目选择model
 * schema: { layout: 'left'} - 和uiconfig的布局对应，渲染最重要的几个信息
 *
 */

define(function(require, exports, module){
	//
	var serivce = require('src/base/service');
	//
	var Model = Backbone.Model.extend({
		events: {
			'schemaChanged': 'schema变更，此时要重新拉数据并渲染',
		},

		initialize: function(){
			// bind
			var parent = this.get('parent');
			parent.on('schemaChanged', this.onSchemaChanged, this);

			// 类目选择
			var categoryServiceId = 'category';
			var CategoryModel = serivce.getModel(categoryServiceId);
			var category = new CategoryModel({id: categoryServiceId});
			this.set(categoryServiceId, category);

			// 作为单实例，挂到as上
			as.category = category;
		},

		onSchemaChanged: function(){
			var parent = this.get('parent');
			var layoutModel = parent.getLayout(this.get('layout'));
			this.set('layoutModel', layoutModel);
			this.trigger('schemaChanged');
		}
	});

	//
	module.exports = Model;
});