/**
 * 
 */

define(function(require, exports, module){
	//
	var LayoutView = require('src/schema/layout/view');
	var service = require('src/base/service');

	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'left',

		initialize: function(){
			this.model.on('schemaChanged', this.render, this);

			var CategoryView = service.getView('category');
			var category = new CategoryView({model: this.model.get('category')});
			category.render();
			this.$el.append(category.$el);
		},

		render: function(){
			// clear
			this.$('.layout').remove();

			// render schema
			var layoutModel = this.model.get('layoutModel');
			if(layoutModel){
				var layoutView = new LayoutView({model: layoutModel});
				layoutView.render();
				this.$el.append(layoutView.$el);
			}
		}

	});

	//
	module.exports = View;
});