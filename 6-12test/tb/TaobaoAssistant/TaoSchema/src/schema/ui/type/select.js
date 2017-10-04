/**
 * model: SchemaField
 * 下拉列表单选
 */

define(function(require, exports, module){
	//
	var base = require('src/schema/ui/base/index');
	var BaseView = require('src/schema/baseview');

	//
	var View = BaseView.extend({
		tagName: 'div',
		className: 'schema',

		initialize: function(){
			// 继承schema行为
			BaseView.prototype.initialize.apply(this, arguments);
			
			// 数据准备
			this.top = new base.TopSchemaView({model: this.model});
			this.select = new base.AsSelectView({model: this.model});
			this.bottom = new base.BottomSchemaView({model: this.model});
		},

		render: function(){
			this.$el.html('');
			
			this.top.render();
			this.$el.append(this.top.$el);

			this.select.render();
			this.$el.append(this.select.$el);

			this.bottom.render();
			this.$el.append(this.bottom.$el);
		}
	});

	//
	module.exports = View;
});