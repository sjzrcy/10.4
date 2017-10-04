/*
 *
 */
define(function(require, exports, module){
	//
	var ImagePreview = require('src/base/common/imagepreview');

	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'single-image',

		events: {
			'click .plus-icon, .upload': function(){
				var me = this;
				as.shell.choosePictures(function(images){
					if(_.isString(images) && images.length > 0){
						images = images.split(',');
						if(images.length > 0){
							me.setValue(images[images.length - 1]);
						}
					}
				});
			},

			'click .check': function(){
				this.showPreview();
			},

			'click .remove': function(){
				this.removeValue();
			}
		},

		initialize: function(){
			this.model.on('valueUpdated', this.render, this);
		},

		render: function(){
			this.$el.empty();

			var value = this.model.value();
			if(!value){
				this.$el.append(this.renderEmpty());
			}else{
				this.$el.append(this.renderValue(value));
			}
		},

		renderEmpty: function(){
			var code = '<span class="plus-icon">+</span><span class="upload">上传</span>';
			return $(code);
		},

		renderValue: function(){
			var code = '<span class="normal-text">已上传</span><span class="check">查看</span><span class="remove">删除</span>';
			return $(code);
		},

		removeValue: function(){
			this.model.setValue(undefined);
			this.render();
		},

		setValue: function(url){
			if(url){
				this.model.setValue(url);
				this.render();
			}
		},

		showPreview: function(){
			var url = this.model.value();
			var preview = new ImagePreview(url);
			preview.show();
		}
	});

	// exports
	module.exports = View;
});