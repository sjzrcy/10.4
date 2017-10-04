/**
 * 
 */

define(function(require, exports, module){
	//
	var LayoutView = require('src/schema/layout/view');
	var SkuModel = require('src/schema/ui/sku/sku/model');
	var SkuView = require('src/schema/ui/sku/sku/view');
	
	//
	var View = Backbone.View.extend({
		initialize: function(){
			var me = this;
			this.$tab = $('<div>').addClass('main-item')
								  .attr('id', this.model.get('id'))
								  .text(this.model.get('title'))
								  .click(function(){
								  	  me.model.active();
								  });

			this.$panel = $('<div>').addClass('main-sub-panel sku clearfix').attr('link', this.model.get('id'));
			this.model.on('schemaChanged', this.render, this);
		},

		render: function(){
			//
			this.$panel.empty();
			this.doVisibility();

			// render sku
			var layoutModel = this.model.get('layoutModel');
			if(layoutModel){
				var skuModel = new SkuModel({sku: layoutModel});
				var skuView = new SkuView({model: skuModel});
				skuView.render();
				this.$panel.append(skuView.$el);
			}
		},

		doVisibility: function(){
			var layoutModel = this.model.get('layoutModel');
			if(layoutModel){
				this.$tab.show();
				this.$panel.show();
			}else{
				this.$tab.hide();
				this.$panel.hide();
			}
		}
	});

	//
	module.exports = View;
});