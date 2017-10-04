/**/

define(function(require, exports, module){
	//
	var Dialog = require('src/schema/ui/sku/metas/footsize/dialog');

	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'size-measure',

		events: {
			'click .text-add': function(){
				this.showDialog();
			},

			'click .edit': function(){
				this.showDialog();
			},

			'click .remove': function(){
				this.model.setValue(undefined);
				this.render();
			}
		},

		initialize: function(){

		},

		render: function(){
			this.$el.empty();

			var value = this.model.value();
			if(_.isObject(value)){
				this.renderEdit();
			}else{
				this.renderEmpty();
			}
		},

		renderEdit: function(){
			this.$el.append($('<div class="normal-text">已添加脚型图和测量方法图，将显示在宝贝详情中</div>'));
			this.$el.append($('<div class="button edit">').text('编辑'));
			this.$el.append($('<div class="button remove">').text('删除'));
		},

		renderEmpty: function(){
			this.$el.append($('<div class="text-add">+&nbsp;添加</div>'));
		},

		showDialog: function(){
			var me = this;
			var dialog = new Dialog({model: {
				title: this.model.get('title'),
				buttons: [{
					text: '确定',
					click: function(){
						dialog.confirmClose = true;
						me.model.setValue(dialog.value());
						me.render();
						dialog.close();
					}
				}],
				offset:{
					left: 120,
					top: 38
				},
				ui: this.model.get('dialog'),
				value: this.model.value()
			}});

			dialog.render();
		}
	});

	//
	module.exports = View;
});