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

			// 有备注或者自定义
			if(this.model.get('custom') || this.model.get('remark')){
				this.multiselect = new base.AsMultiselectSkuView({model: this.model});
			}else if(this.model.get('style') === 'vertical'){ // 垂直排版
				this.multiselect = new base.AsMultiselectVView({model: this.model});
			}else{ // 横向自动排版
				this.multiselect = new base.AsMultiselectView({model: this.model});
			}
			
			this.bottom = new base.BottomSchemaView({model: this.model});
		},

		render: function(){
			this.$el.html('');
			
			this.top.render();
			this.$el.append(this.top.$el);

			this.multiselect.render();
			this.$el.append(this.multiselect.$el);

			this.bottom.render();
			this.$el.append(this.bottom.$el);
		}
	});

	//
	module.exports = View;
});