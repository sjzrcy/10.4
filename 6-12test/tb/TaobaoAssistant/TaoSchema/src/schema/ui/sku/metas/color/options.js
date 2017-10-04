/**
 * IN:
 * options
 *
 * OUT:
 * option
 */

define(function(require, exports, module){
	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'color-options-panel',

		events: {
			'click .color-option': function(){
				var $option = $(event.srcElement);
				if(!$option.hasClass('color-option')){
					$option = $option.parent();
				}

				var data = {
					'host': this.$host, 
					'option': {
						text: $option.text(), 
						value: $option.attr('value')
					}
				};

				this.trigger('selected', data);
				this.hide();
			}
		},

		initialize: function(){
			$('body').append(this.$el);

			// 如果不支持别名，当点击外面时自动关闭
			this.showTime = new Date('2014-07-07 10:10:10');
			if(!this.alias){
				var me = this;
				$('body').click(function(){
					if(me.isVisible() && !as.util.isCoverCursor(me.$el) && ((new Date()).getTime() - me.showTime.getTime()) > 400){
						me.hide();
					}
				});
			}
		},

		render: function(){
			var $arrow = $('<div class="color-arrow">');
			this.$el.append($arrow);

			var $options = $('<div class="color-options">');
			this.$el.append($options);

			var me = this;
			$options.hover(function(){
				me.hover = true;
			}, function(){
				me.hover = false;
			});

			_.each(this.model, function(option){
				var $option = $('<span class="color-option">').attr('value', option.value);
				var $colorBlock = $('<span class="color-block">');
				if(option.imgUrl){
					$colorBlock.css('background-image', 'url("' + encodeURI(option.imgUrl) + '")');
				}else{
					$colorBlock.css('background-color', option.rgb);
				}

				$option.append($colorBlock).append(option.text);
				$options.append($option);
			});

			this.$el.hide();
		},

		show: function($host){
			this.$host = $host;

			var offset = $host.offset();
			offset.top += ($host.height() + 8);

			this.$el.show();
			this.$el.offset(offset);
			this.showTime = new Date();
		},

		hide: function(isCheckHover){
			if(isCheckHover){
				if(!this.hover){
					this.$el.hide();
				}
			}else{
				this.$el.hide();	
			}
		},

		isVisible: function(){
			return this.$el.is(':visible');
		}
	});

	//
	module.exports = View;
});