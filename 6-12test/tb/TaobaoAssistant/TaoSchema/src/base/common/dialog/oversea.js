/*
url: 已经自动登录的链接
*/
define(function(require, exports, module){
	//
	var BaseDialog = require('src/base/common/dialog/dialog');

	//
	var View = BaseDialog.extend({
		initialize: function(){
			BaseDialog.prototype.initialize.apply(this, arguments);
			this.$panel.addClass('oversea-dialog');
			this.$('.title-bar').remove();
			this.$('.content').css({
				"border": "none",
				"background-color": "transparent"
			});
		},

		render: function(){
			this.$panel.empty();

			var $iframe = $('<iframe>').attr('src', this.model.url);
			$iframe.css('border', 'none');
			$iframe.width(this.model.size.width);
			$iframe.height(this.model.size.height);

			this.$panel.append($iframe);
			this.$el.appendTo($('body'));
		}
	});

	//
	module.exports = View;
});