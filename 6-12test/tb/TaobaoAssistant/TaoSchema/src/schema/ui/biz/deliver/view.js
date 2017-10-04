/**
 * 
 */

define(function(require, exports, module){
	//
	var DELIVER_WAY = 'deliverWay';
	var DeliverView = require('src/schema/ui/biz/deliver/deliver');
	var SchemaTopView = require('src/schema/ui/base/schematop');

	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'schema',

		initialize: function(){
			var children = this.model.children();
			this.deliverWay = _.find(children, function(child){
				return (child.id === DELIVER_WAY);
			});
		},

		render: function(){
			//
			this.$el.html('');

			//
			var top = new SchemaTopView({'model': this.deliverWay});
			top.render();
			this.$el.append(top.$el);

			var deliver = new DeliverView({'model': this.model});
			deliver.render();
			this.$el.append(deliver.$el);
		}
	});

	//
	module.exports = View;
});