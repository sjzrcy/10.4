
define(function(require, exports, module){
	//
	var Dialog = require('src/schema/ui/sku/metas/sizetemplate/dialog');
	var translate = require('src/base/shell/translate');

	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'size-template',

		events: {
			'click .text-add': function(){
				this.showDialog();
			},

			'click .edit': function(){
				this.showDialog();
			},

			'click .remove': function(){
				this.model.setValue(undefined);
				this.render();
			},

			'click .add-detail :checkbox': function(){
				var $checkbox = $(event.srcElement);
				var value = this.model.value();
				if(_.isObject(value)){
					value.isShow = $checkbox.prop('checked');
					this.model.setValue(value);
				}
			}
		},

		initialize: function(){
			this.dialog = null;
		},

		render: function(){
			this.$el.empty();

			var value = this.model.value();
			if(_.isObject(value) && value.templateId){
				this.renderEdit();
			}else{
				this.renderEmpty();
			}
		},

		renderEmpty: function(){
			var $text = $('<div class="text-add">+&nbsp;添加</div>');
			this.$el.append($text);
		},

		renderEdit: function(){
			this.$el.append($('<div class="normal-text">已添加对照表，将显示在买家尺寸选择区域</div>'));
			this.$el.append($('<div class="button edit">').text('编辑'));
			this.$el.append($('<div class="button remove">').text('删除'));
			this.$el.append(this.checkbox());
		},

		checkbox: function(){
			var html = '<div class="add-detail"><input type="checkbox"/>同时展示在宝贝详情区域</div>'
			var $option = $(html);
			$(':checkbox', $option).prop('checked', this.isAddDetailChecked());
			return $option;
		},

		isAddDetailChecked: function(){
			var value = this.model.value();
			return (_.isObject(value) && value.isShow);
		},

		getUrl: function(){
			var url = this.model.get('url');
			url += '&from=as';
			url += ('&save=' + this.saveCb);
			url += ('&open=' + this.openCb);

			return encodeURIComponent(url);
		},

		save: function(obj){
			var value = this.model.value();
			if(!_.isObject(value)){
				value = {};
			}
			value.templateId = obj.id;
			this.model.setValue(value);

			// close dialog
			if(this.dialog){
				this.dialog.close();
				delete this.dialog;
			}

			// 重新渲染
			this.render();
		},

		open: function(obj){
			as.shell.openUrl(obj.url, obj.isAutoLogined);
		},

		beforeOpen: function(){
			this.saveCb = translate(this.save.bind(this), true);
			this.openCb = translate(this.open.bind(this), true);
		},

		onClose: function(){
			if(this.saveCb){
				delete window[this.saveCb];
				delete this.saveCb;
			}

			if(this.openCb){
				delete window[this.openCb];
				delete this.openCb;
			}
		},

		showDialog: function(){
			// 开组件前做一些准备工作
			this.beforeOpen();

			/////////////////////////////////////////////////////////////////////////////////////
			var me = this;
			as.shell.getAutoLoginUrl(this.getUrl(), function(jsonstr){
				var url = as.util.fetchUrl(jsonstr);
				if(!url){
					as.util.showErrorTip('登录失败，请重试或者保存数据后重新打开助理');
					return;
				}

				me.dialog = new Dialog({model: {
					title: me.model.get('title'),
					url: url,
					offset: {
						top: 38,
						left: 120
					},
					closeCb: function(){
						me.onClose();
					}
				}});

				me.dialog.render();
			});
		}
	});

	//
	module.exports = View;
});