/**
 * main 控件
 * {tab:, id:, title:,}
 */

define(function(require, exports, module){
	//
	var service = require('src/base/service');

	//
	var TabItemModel = Backbone.Model.extend({
		events: {
			'moveTo': '子页面跳转'
		},

		initialize: function(){
			var subTabs = [];
			var me = this;
			
			var subServices = service.getChildren(this.id);
			_.each(subServices, function(service){
				var Model = service.model;
				var title = 'default';
				if(service.other && service.other.title){
					title = service.other.title;
				}

				var model = new Model({parent: me, id: service.id, title: title, order: service.order});
				subTabs.push(model);
			});

			this.set({'subTabs': subTabs, 'current': 0});

			// 从其他tab切换回基本信息编辑页
			as.schema.on('change2ItemTab', function(){
				me.active();
			});
		},

		active: function(){
			var parent = this.get('parent');
			parent.setCurrent(this.get('id'));

			// 标记插件未被激活 
			as.popPlugin = false;
			as.schema.trigger('basicPageActived');
		},

		moveTo: function(id){
			this.trigger('moveTo', id);
		}
	});

	//
	module.exports = TabItemModel;
});