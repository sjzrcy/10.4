/**
 * model: SchemaField
 * 单图
 */

define(function(require, exports, module){
	//
	var base = require('src/schema/ui/base/index');
	var BaseView = require('src/schema/baseview');
	var SingleImageView = require('src/schema/ui/qualification/singleimage/index');
	//
	var View = BaseView.extend({
		tagName: 'div',
		className: 'schema',

		initialize: function(){
			// 继承schema行为
			BaseView.prototype.initialize.apply(this, arguments);

			// 数据准备
			this.top = new base.TopSchemaView({model: this.model});
			this.image = new SingleImageView({model: this.model});
			this.bottom = new base.BottomSchemaView({model: this.model});
		},

		render: function(){
			this.$el.empty();
			
			this.top.render();
			this.$el.append(this.top.$el);

			this.image.render();
			this.$el.append(this.image.$el);

			this.bottom.render();
			this.$el.append(this.bottom.$el);
		}
	});

	//
	module.exports = View;
});