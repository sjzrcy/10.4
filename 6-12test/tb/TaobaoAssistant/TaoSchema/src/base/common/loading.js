/**
 * 
 */

define(function(require, exports, module){
	//
	var MIN = 1;
	var MAX = 4;
	var DOT = '.';

	var status = function(count){
		var text = '';
		for(var i = 1; i <= count; ++i){
			text += DOT;
		}

		return text;
	};

	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'dialog-bg',
		
		initialize: function(){
			var $box = $('<div class="loading-box">');
			$(window).resize(function(){
				$box.height(document.documentElement.clientHeight - 32);
			});

			this.$box = $box;
			this.$el.append($box);

			var $icon = $('<div class="loading-icon">');
			$box.append($icon);

			var $text = $('<div class="loading-text">').text(this.model.text);
			$box.append($text);

			var $status = $('<div class="loading-status">').text('.');
			$box.append($status);

			// 在render中更新
			this.$status = $status;
			this.count = MIN;
		},

		render: function(){
			this.$status.text(status(this.count));
		},

		show: function(){
			if(this.timer){
				clearInterval(this.timer);
				this.timer = undefined;
			}

			$('body').append(this.$el);
			this.$box.height(document.documentElement.clientHeight - 32);
			this.render();

			var me = this;
			this.timer = setInterval(function(){
				me.count += 1;
				if(me.count > MAX){
					me.count = MIN;
				}
				me.render();
			}, this.model.interval);
		},

		hide: function(){
			if(this.timer){
				clearInterval(this.timer);
				this.timer = undefined;
			}

			this.count = MIN;
			this.$el.detach();
		}
	});

	//
	module.exports = new View({model: {text: '正在加载，请稍后', interval: 300}});
});