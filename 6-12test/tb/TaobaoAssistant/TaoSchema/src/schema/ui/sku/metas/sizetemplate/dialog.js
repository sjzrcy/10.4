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
			this.$panel.addClass('size-tempalte-dialog');
			this.$iframe = $('<iframe>').attr('src', this.model.url);
		},

		render: function(){
			this.$panel.empty();
			this.$panel.append(this.$iframe);
			this.$el.appendTo($('body'));

			this.$('.content').css('width', '800px');
			this.$('.dialog').css('width', '802px');
		}
	});

	//
	module.exports = View;
});