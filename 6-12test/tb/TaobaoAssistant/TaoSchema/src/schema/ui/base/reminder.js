/**
 * IN:
 * align: 这个与自身绘制无关，是容器定位它的依据
 * mode: 交互模式
 * level：提示类型，决定图标和基础样式
 * text：提示主体，支持富文本
 *
 * 使用者需要设置box和maxWidth
 * window resize时，更新maxWidth
 * box提供方法，当前剩余多少空间
 */
define(function(require, exports, module){
	//
	var Tooltip = require('src/schema/ui/base/tooltip');

	//
	var Reminder = Backbone.View.extend({
		tagName: 'div',
		className: 'reminder clearfix',

		initialize: function(){
			this.renders = {
				'normal': 'renderNormal',
				'hover': 'renderHover'
			};

			$(window).bind("resize", this, this.onWindowResize);
		},

		isInvalidLevel: function(level){
			return (['normal', 'guide', 'warn', 'error'].indexOf(level) !== -1);
		},

		iconClass: function(level){
			if(this.isInvalidLevel(level)){
				return level;
			}else{
				return 'normal';
			}
		},

		textClass: function(level){
			if(this.isInvalidLevel(level)){
				return level + '-text';
			}else{
				return 'normal-text';
			}
		},

		render: function(){
			//
			this.$el.html('');
			
			var handler = this[this.renders[this.model.mode]];
			if(_.isFunction(handler)){
				handler.apply(this);
			}
		},

		renderNormal: function(){
			//
			var $icon = $('<div>').addClass('icon').addClass(this.iconClass(this.model.level));
			this.$el.append($icon);

			var $text = $('<div>').addClass('text').addClass(this.textClass(this.model.level)).html(this.model.text);
			this.$el.append($text);
			as.util.handleATag(this.$el);

			// 设置尺寸和hover
			var me = this;
			setTimeout(function(){
				me.updateSize();	
			}, 10);
		},

		renderHover: function(){
			var $icon = $('<div class="icon-box">').addClass(this.iconClass(this.model.level));
			this.$el.append($icon);

			var tooptip = new Tooltip($icon, this.model.text);
			$icon.hover(function(){
				tooptip.show();
			}, function(){
				tooptip.hide();
			});
		},

		onWindowResize: function(e){
			var me = e.data;
			if(me.box){
				me.maxWidth = me.box.leaveWidth(me.el);
				me.updateSize();
			}
		},

		updateSize: function(){
			// 33 = 28(margin-left) + 4(margin-right) + 1(小数点修正)
			var marginLeft = as.util.numberOfPx(this.$el.css('margin-left'));
			var marginRight = as.util.numberOfPx(this.$el.css('margin-right'));
			this.$el.css('max-width', (this.maxWidth - (marginLeft + marginRight + 1)) + 'px');

			// 49 = 33(见上注) + 16(icon)
			var textWidth = (as.util.measureText(this.model.text)).width;
			this.$('.text').prop("title", (textWidth > (this.maxWidth - (marginLeft + marginRight + 16))? this.model.text: ''));
		}
	});

	module.exports = Reminder;
});