/**
 * 
 */

define(function(require, exports, module){
	//
	var base = require('src/schema/ui/base/index');
	var BaseView = require('src/schema/baseview');

	//
	var View = BaseView.extend({
		tagName: 'div',
		className: 'schema',

		initialize: function(){
			// 继承schema行为
			BaseView.prototype.initialize.apply(this, arguments);
			// 监听发货地是否为海外
			this.model.on('actionStatusChanged', this.onActionStatusChanged, this);

			this.allOptions = [];
			this.isOversea = false;

			var me = this;
			as.shell.getDeliverTemplateOptions(false, function(options){
				// 更新状态
				if(_.isArray(options) && options.length > 0 && me.select){
					me.allOptions = options;
					me.model.set('options', me.options());
					me.model.set('optiontip', me.optionTip());
					me.select.render();
				}else{
					as.util.showErrorTip('运费模板获取失败，麻烦点击“刷新”重新获取');
				}
			});

			// 数据准备-替换掉top，增加编辑和刷新入口
			this.top = new base.TopSchemaView({model: this.model});
			this.select = new base.AsSelectView({model: this.model});
			this.bottom = new base.BottomSchemaView({model: this.model});
		},

		render: function(){
			this.$el.empty();
			
			this.top.render();
			this.top.$el.append(this.refresh()).append(this.edit());
			this.$el.append(this.top.$el);

			this.select.render();
			this.$el.append(this.select.$el);

			this.bottom.render();
			this.$el.append(this.bottom.$el);
		},

		refresh: function(){
			var me = this;
			var $refresh = $('<div class="float-right deliver-template-button">').text('刷新').click(function(){
				as.shell.getDeliverTemplateOptions(true, function(options){
					if(_.isArray(options) && options.length > 0){
						me.allOptions = options;
						me.model.set('options', me.options());
						me.model.set('optiontip', me.optionTip());
						me.select.render();
						as.util.showOkTip('刷新成功');
					}else{
						as.util.showErrorTip('运费模板获取失败，麻烦点击“刷新”重新获取');
					}
				});
			});
			return $refresh;
		},

		edit: function(){
			var url = 'http://wuliu.taobao.com/user/logis_tools.htm?tab_source=carriageTemplate';
			var $edit = $('<div class="float-right deliver-template-button">').text('编辑>>').click(function(){
				as.shell.openUrl(url, true);
			});
			return $edit;
		},

		onActionStatusChanged: function(name, value){
			if(name === 'setOversea'){
				this.isOversea = value? true: false;
				this.model.set('options', this.options());
				this.model.set('optiontip', this.optionTip());
				this.select.render();
			}
		},

		options: function(){
			if(this.isOversea){
				var options = [];
				for(var i = 0; i < this.allOptions.length; ++i){
					if(this.allOptions[i].oversea){
						options.push(this.allOptions[i]);
					}
				}
				return options;
			}else{
				return this.allOptions;
			}
		},

		optionTip: function(){
			if(this.isOversea){
				return '<span style="color: #FF6600;">海外直邮商品，只能选择宝贝地址为海外的运费模板</span>';
			}else{
				return '';
			}
		}
	});

	//
	module.exports = View;
});