/**
 * 
 */

define(function(require, exports, module){
	//
	var service = require('src/base/service');

	//
	var BasicView = Backbone.View.extend({
		initialize: function(){
			var me = this;
			this.$tab = $('<div>').addClass('main-item')
								  .attr('id', this.model.get('id'))
								  .text(this.model.get('title'))
								  .click(function(){
								  	  me.model.active();
								  });

			this.$panel = $('<div>').addClass('main-sub-panel basic clearfix').attr('link', this.model.get('id'));
			_.each(this.model.get('subModels'), function(model){
				var View = service.getView(model.id);
				var view = new View({model: model});
				me.$panel.append(view.$el);
			});
		},

		render: function(){
			
		}
	});

	//
	module.exports = BasicView;
});