/**
 * 自动关闭的提示信息
 * IN：
 * text, icon, time
 */

define(function(require, exports, module){
	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'tab-tip',

		initialize: function(){
			var DefaultIcon = '../img/tip-ok.png';
			var DefaultTime = 1000 * 2;
			this.text = this.model.text;
			this.icon = _.isString(this.model.icon)? this.model.icon: DefaultIcon;
			this.time = _.isString(this.model.time)? this.model.time: DefaultTime;
		},

		render: function(){
			var $image = $('<img/>').attr('src', this.icon);
			var $text = $('<span>').text(this.text);
			
			var width = as.util.measureText(this.text).width;
			this.$el.css('width', (width + 20) + 'px').css('left', (1008 - (width + 20)) + 'px');

			this.$el.append($image).append($text);
			$('body').append(this.$el);

			var me = this;
			setTimeout(function(){
				me.$el.remove();
			}, this.time);
		}
	});

	//
	module.exports = View;
});