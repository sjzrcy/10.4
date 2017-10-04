/**
 *
 * id
 * title
 * parent 
 *
 */

define(function(require, exports, module){
	//
	var service = require('src/base/service');

	//
	var BasicModel = Backbone.Model.extend({
		events: {
			'schemaChanged': '作为父容器，需要处理全局schema信号，并向子容器发送schema信号'
		},

		initialize: function(){
			// bind
			as.schema.on('schemaChanged', this.onSchemaChanged, this);

			// create children
			var me = this;
			var subServices = service.getChildren(this.id);
			var subModels = [];
			_.each(subServices, function(subService){
				var Model = subService.model;
				var layout = '';
				if(subService.other && subService.other.layout){
					layout = subService.other.layout;
				}
				subModels.push(new Model({'id': subService.id, 'layout': layout, parent: me}));
			});

			this.set('subModels', subModels);
		},

		active: function(){
			var parent = this.get('parent');
			parent.moveTo(this.id);
		},

		getLayout: function(id){
			var layoutModel = this.get('layoutModel');
			if(!_.isObject(layoutModel)){
				return;
			}

			var children = layoutModel.children();
			if(!_.isArray(children)){
				return;
			}

			return (_.find(children, function(child){
				return (child.id === id);
			}));
		},

		onSchemaChanged: function(){
			var layoutModel = as.schema.getLayout(this.get('id'));
			this.set('layoutModel', layoutModel);
			this.trigger('schemaChanged');
		}
	});

	module.exports = BasicModel;
});