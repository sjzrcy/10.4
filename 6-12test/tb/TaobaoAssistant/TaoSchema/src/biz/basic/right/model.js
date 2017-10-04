/**
 *
 * 基本信息 - 右侧
 * 
 * in：
 * schema: { layout: 'right'} - 和uiconfig的布局对应，渲染多媒体信息和店铺类目
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