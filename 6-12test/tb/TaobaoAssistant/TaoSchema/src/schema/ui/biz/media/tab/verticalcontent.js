/**
 * 
 */

define(function(require, exports, module){
	//
	var VerticalImageView = require('src/schema/ui/biz/media/tab/verticalimageview');

	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'com-media',

		initialize: function(){
			var field = this.model.field;
			var parent = this.model.parent;
			field.on('focus', this.onFocus, this);
			field.on('focus', parent.onFocus, parent);
			field.on('hasError', parent.onHasError, parent);
			field.on('noError', parent.onNoError, parent);

			this.subs = [(new VerticalImageView({model: {field: field}}))];
		},

		render: function(){
			// 清空
			this.$el.empty();

			// render media
			var $previewBox = $('<div>').addClass('preview-box');
			var $bar = $('<div>').addClass('bar6');
			this.$el.append($previewBox).append($bar);

			_.each(this.subs, function(sub, index){
				sub.render();
				$bar.append(sub.$thumbnail);
				$previewBox.append(sub.$preview);
			});
		},

		onFocus: function(){
			as.util.scrollTo(this.el);
		}
	});

	//
	module.exports = View;
});