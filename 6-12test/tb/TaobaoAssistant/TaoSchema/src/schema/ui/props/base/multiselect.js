/**
 * 
 */

define(function(require, exports, module){
	//
	var DIALOG = 'dialog';
	var NORMAL = 'normal';

	//
	var NormalView = require('src/schema/ui/props/base/multiselect/normal/index');
	var DialogView = require('src/schema/ui/props/base/multiselect/dialog/index');

	//
	var View = Backbone.View.extend({
		initialize: function(){
			// 识别交互模式
			this.mode = (this.model.get('options').length >= 10)? DIALOG: NORMAL;

			// 设置构造函数
			if(this.mode === DIALOG){
				this.view = new DialogView({model: this.model});
			}else{
				this.view = new NormalView({model: this.model});
			}

			// view嫁接
			this.setElement(this.view.el);
		},

		render: function(){
			this.view.render();
		}
	});

	//
	module.exports = View;
});