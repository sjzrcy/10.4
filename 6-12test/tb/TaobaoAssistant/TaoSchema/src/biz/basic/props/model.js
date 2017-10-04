/**
 * 基本信息 - 左侧
 *
 * 类目属性
 *
 * in：
 * schema: { layout: 'props'} - 和uiconfig的布局对应，渲染最重要的几个信息
 *
 */

define(function(require, exports, module){
	//
	var schemaService = require('src/schema/schema');
	var serivce = require('src/base/service');
	//
	var Model = Backbone.Model.extend({
		events: {
			'schemaChanged': 'schema变更，此时要重新拉数据并渲染',
		},

		initialize: function(){
			// schema变更后，重新渲染
			schemaService.on('schemaChanged', this.onSchemaChanged, this);

			// title
			this.set({
				'title': '宝贝属性',
				'must': false,
				'reminders': []
			});
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