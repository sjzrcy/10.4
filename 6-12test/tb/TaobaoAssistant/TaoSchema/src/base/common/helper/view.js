/**
 * 发布助手
 */

define(function(require, exports, module) {

	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'helper',

		initialize: function() {
			this.model.on('helperUpdated', this.render, this);
		},

		render: function() {
			this.$el.empty();
			$('body').append(this.$el);

			var text = this.model.get('text');
			var cRect = this.model.get('cRect');
			log('text=' + text + ',cRect=' + JSON.stringify(cRect));

			var me = this;
			if (!this.model.get('isToShow')) {
				me.hide();
				return;
			}

			$('body').click(function(e) {
				var cursorPos = {};
				cursorPos.x = e.clientX;
				cursorPos.y = e.clientY;
				if (!as.util.isCoverCursor(me.$el) && !me.isCoverModule(cursorPos, cRect)) {
					me.hide();
				}
				return;
			});

			var $titleBar = $('<div class="title-bar">');
			var $title = $('<div class="title-text float-left">').html('');
			var $closeButton = $('<div class="close-button float-right">').text('×');
			$closeButton.click(function() {
				me.hide();
				return;
			});
			$titleBar.append($title).append($closeButton);
			this.$el.append($titleBar);
			this.$el.append($("<div class='content'>").html(text));

			var helperRect = this.countNewRect(cRect);

			this.$el.css({
				'left': helperRect.left + 'px',
				'top': helperRect.top + 'px'
			});
			this.$el.show(100);
		},

		countNewRect: function(cRect) {
			var bodyWidth = $('body').width();
			var bodyHeight = $('body').height();
			log('cRect=' + JSON.stringify(cRect));

			var helperHeight = this.$el.height();
			var helperWidth = this.$el.width();
			var helperRect = {};
			helperRect.top = cRect.y - helperHeight;
			helperRect.left = cRect.x;

			//fix
			if (helperRect.top < 35) {
				helperRect.top = helperRect.top + cRect.h + helperHeight;
			}
			if (helperRect.left + helperWidth > bodyWidth) {
				helperRect.left = bodyWidth - helperWidth - 50;
			}

			return helperRect;
		},

		isCoverModule: function(cursorPos, uiRect) {
			return (cursorPos.x > uiRect.x && cursorPos.x < (uiRect.x + uiRect.w) &&
				cursorPos.y > uiRect.y && cursorPos.y < (uiRect.y + uiRect.h));
		},

		hide: function() {
			if (this.$el) {
				this.$el.hide(40);
				this.model.set('isToShow', true);
				this.model.set('currentId', undefined);
			}
		}
	});

	module.exports = View;
});