/**
 * 自动关闭的提示信息
 * IN：
 * text, icon, time
 */

define(function(require, exports, module){
	//
	var MAX_WIDTH = 160;
	var LEFT_OFFSET = 20;

	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'assistant-tip',

		initialize: function(){
			var DefaultIcon = '../img/tip-ok.png';
			var DefaultTime = 1000 * 2;
			this.text = this.model.text;
			if(_.isObject(this.text)){
				this.text = JSON.stringify(this.text);
			}
			this.icon = _.isString(this.model.icon)? this.model.icon: DefaultIcon;
			this.time = _.isString(this.model.time)? this.model.time: DefaultTime;
		},

		render: function(){
			var $box = $('<div class="assistant-content">');
			var $image = $('<img/>').attr('src', this.icon);
			var $text = $('<span>').text(this.text);
			
			var width = as.util.measureText(this.text).width;
			var height = (parseInt(width / MAX_WIDTH) + (width % MAX_WIDTH > 0? 1: 0)) * 18;
			width = width > MAX_WIDTH? MAX_WIDTH: width;
			$text.css('width', width + 'px').css('top', (80 - height) / 2 + 'px').css('left', ((200 - (LEFT_OFFSET + width)) / 2 + LEFT_OFFSET) + 'px');
			$image.css('top', (80 - height) / 2 + 'px').css('left', (200 - (LEFT_OFFSET + width)) / 2 + 'px');

			$box.append($image).append($text);
			this.$el.append($box);
			$('body').append(this.$el);

			var top = (document.documentElement.clientHeight - this.$el.height()) / 2;
			this.$el.css('top', top + 'px');

			var me = this;
			setTimeout(function(){
				me.$el.remove();
			}, this.time);
		}
	});

	//
	module.exports = View;
});