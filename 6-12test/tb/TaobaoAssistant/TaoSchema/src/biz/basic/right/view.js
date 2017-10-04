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
		className: 'right',

		initialize: function(){
			this.model.on('schemaChanged', this.render, this);
		},

		render: function(){
			//
			this.$el.html('');
			
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