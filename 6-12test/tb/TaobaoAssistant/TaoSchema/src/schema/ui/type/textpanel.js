/**
 * model: SchemaField
 * 单图
 */

define(function(require, exports, module){
	//
	var BaseView = require('src/schema/baseview');

	//
	var View = BaseView.extend({
		tagName: 'div',
		className: 'schema',

		events: {
			'click a': function(){
				return as.util.onClickATag($(event.srcElement));
			}
		},

		initialize: function(){
			// 继承schema行为
			BaseView.prototype.initialize.apply(this, arguments);
		},

		render: function(){
			this.$el.empty();
			
			var $e = $('<div class="text-panel">').html(this.model.get('text'));
			this.$el.append($e);
		}
	});

	//
	module.exports = View;
});