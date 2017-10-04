/**
 * 容器
 * biz: 'price-quantity',
 * layoutModel
 * 
 */

define(function(require, exports, module){
	//
	var SchemaTop = require('src/schema/ui/base/schematop');
	var MetaView = require('src/schema/ui/biz/price-quantity/meta-view');
	var SchemaBottom = require('src/schema/ui/base/schemabottom');

	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'schema',

		initialize: function(){
			this.metas = [];
			var me = this;
			_.each(this.model.children(), function(child){
				me.metas.push(new MetaView({'model': child}));
			});
		},

		render: function(){
			// clear
			this.$el.html('');

			this.model.set('title', '宝贝价格');
			var top = new SchemaTop({'model': this.model});
			top.render();
			this.$el.append(top.$el);

			var $box = $('<div class="price-quantity">');
			this.$el.append($box);

			var me = this;
			var count = this.metas.length;
			_.each(this.metas, function(meta){
				meta.$el.css('width', 'calc((100% - ' + (count + 1) + 'px) / ' + count + ')');
				meta.render();
				$box.append(meta.$el);
			});

			// reminder
			_.each(this.model.children(), function(child){
				var bottom = new SchemaBottom({model: child});
				bottom.render();
				me.$el.append(bottom.$el);
			});
		}
	});

	//
	module.exports = View;
});