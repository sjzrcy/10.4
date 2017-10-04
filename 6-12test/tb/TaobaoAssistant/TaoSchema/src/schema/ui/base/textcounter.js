/**
 * IN:
 * maxLength
 * currentLength
 * OUT:
 * handle(text)
 */

define(function(require, exports, module){
	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'text-counter',

		initialize: function(){
			this.maxLength = this.model.maxLength;
			this.currentLength = this.model.currentLength;
			this.ERROR = 'error';

			var $current = $('<span class="current">');
			var $seperator = $('<span class="seperator">/</span>');
			var $max = $('<span class="max">').text(this.maxLength);
			this.$el.append($current).append($seperator).append($max);

			this.$current = $current;
		},

		render: function(){
			this.$current.text(this.currentLength);
			if(this.currentLength > this.maxLength){
				if(!this.$current.hasClass(this.ERROR)){
					this.$current.addClass(this.ERROR);
				}
			}else{
				if(this.$current.hasClass(this.ERROR)){
					this.$current.removeClass(this.ERROR);
				}
			}
		},

		handle: function(){
			var me = this;
			var handle = function(domInput){
				// 更新current，重新渲染
				var text = $(domInput).val();
				me.currentLength = as.util.bytes(text);
				me.render();
			};

			return handle;
		}
	});

	//
	module.exports = View;
});