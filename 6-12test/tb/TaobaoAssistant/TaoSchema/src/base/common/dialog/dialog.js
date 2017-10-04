/**
 * 对话框的基类
 * 1.标题栏
 * 2.内容区
 * 3.向下提供$box
 *
 * 输入数据：
 * title
 * beforeCloseCb:关闭前事件，return false表示不允许关闭，并终止关闭流程
 * closeCb：关闭事件
 * buttons: [
	{
		'text': '***',
		'click': function(){}
	},
	{
		'text': '***',
		'click': function(){}
	}
 * offset
   默认屏幕中间
   {
	left
	right
   }
   ]
 */

define(function(require, exports, module){
	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'dialog-bg',

		initialize: function(){
			var $dialog = $('<div class="dialog">');
			this.$el.append($dialog);

			// 允许外部定制位置，默认显示在屏幕中间
			if(_.isObject(this.model.offset)){
				var offset = this.model.offset;
				if(_.isNumber(offset.left)){
					$dialog.css('left', offset.left + 'px');
				}
				if(_.isNumber(offset.top)){
					$dialog.css('top', offset.top + 'px');
				}
			}

			// 标题栏
			var $titleBar = $('<div class="title-bar">');
			var $title = $('<div class="title-text float-left">').html(this.model.title);
			var $closeButton = $('<div class="close-button float-right">').text('×');
			$titleBar.append($title).append($closeButton);
			$dialog.append($titleBar);

			var me = this;
			$closeButton.click(function(){
				me.close();
			});

			var $box = $('<div class="content">');
			$dialog.append($box);

			// 留给子类用的panel画板
			this.$panel = $('<div class="panel">');
			$box.append(this.$panel);

			// 按钮栏
			if(_.isArray(this.model.buttons) && this.model.buttons.length > 0){
				var count = 0;
				var $buttonWrap = $('<div class="button-wrap clearfix">').css('width', this.buttonWrapWidth(this.model.buttons.length) + 'px');
				for(var i = 0; i < this.model.buttons.length; ++i){
					var button = this.model.buttons[i];
					if(button.click && button.text){
						var $button = $('<div class="button">').html(button.text).click(button.click);
						$buttonWrap.append($button);
						count += 1;
					}
				}

				if(count > 0){
					var $bar = $('<div class="bar">');
					$bar.append($buttonWrap);
					$box.append($bar);
				}
			}

			// 支持快捷键ESC退出
			$('body').keydown(function(){
				if(event.which === 27){
					me.close();
				}
			});

			// 点击窗体之外的部分，自动关闭对话框
			this.$el.click(function(){
				if(!as.util.isCoverCursor($dialog)){
					me.close();	
				}
			});

			as.schema.on('beforeSchemaChanged', function(){
				me.innerClose();
			});
		},

		buttonWrapWidth: function(count){
			var BTM = 12;
			var WIDTH = 82;
			return ((BTM + WIDTH) * count - BTM);
		},

		close: function(){
			// 关闭前检查
			var beforeCloseCb = this.model.beforeCloseCb;
			if(_.isFunction(beforeCloseCb) && beforeCloseCb() === false){
				return;
			}

			// 关闭
			this.$el.remove();

			// 关闭后回调
			var closeCb = this.model.closeCb;
			if(_.isFunction(closeCb)){
				closeCb();
			}
		},

		innerClose: function(){
			this.$el.remove();	
		}
	});

	//
	module.exports = View;
});