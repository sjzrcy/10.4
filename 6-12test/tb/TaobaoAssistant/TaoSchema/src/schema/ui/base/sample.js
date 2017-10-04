/*
 * text, url
 */
define(function(require, exports, module){
	//
	var ImagePreview = require('src/base/common/imagepreview');

	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'sample float-right',

		events: {
			'click': function(){
				(new ImagePreview(this.model.url)).show();
			}
		},

		initialize: function(){

		},

		render: function(){
			this.$el.empty();
			this.$el.text(this.model.text);
		}
	});

	//
	module.exports = View;
});