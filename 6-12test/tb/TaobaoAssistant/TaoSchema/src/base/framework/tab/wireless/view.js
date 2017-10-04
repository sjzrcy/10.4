/**
 * tab wireless 控件
 * 创建控件的ID
 * 对应的schema字段的ID
 */
//
define(function(require, exports, module){
	//
	var PLUGIN_ID = 'wireless';
	var FIELD_ID = 'descForMobile';
	var Adapter = require('src/base/framework/plugin-adapter');
	var assistant = require('src/base/common/assistant/model');

	//
	var TabItemView = Backbone.View.extend({
		initialize: function(){
			this.$tab = $('<div class="item">').attr('id', this.model.get('id')).text(this.model.get('title'));
			this.$panel = $('<div class="item">').attr('for', this.model.id).css('height', '0px');
			this.$panel.html('<object class="widget" type="tbassistant/npworkbench-plugin" id="' + PLUGIN_ID + '"></object>');

			var me = this;
			this.$tab.click(function(){
				me.model.active();
			});

			this.adapter = new Adapter(PLUGIN_ID);
			$('body').bind('pluginReady', function(){
				log('NP - pluginReady >> ' + PLUGIN_ID);
				me.adapter.createPlugin();
				setTimeout(function(){
					me.deactive();
				}, 200);
			});
			
			this.lastHeight = 0;
			$(window).resize(function(){
				if(me.$tab.hasClass('active')){
					var height = $(document).height() - 32;
					me.$panel.css('height', height + 'px');
					if(me.lastHeight !== height){
						me.lastHeight = height;
						me.trigger('resize');
					}
				}
			});

			this.on('resize', this.onResize, this);

			// 和schema之间的通信
			as.schema.on('schemaChanged', this.onSchemaChanged, this);

			// before save
			as.schema.registerBeforeSaveHandler(function(notifyFinishedCb){
				if(!me.field){
					notifyFinishedCb();
					return;
				}

				// 取值并保存
				me.adapter.get(function(content){
					log('descForMobile' ,content);
					if(me.field){
						var value;
						try{
							value = JSON.parse(content);
						}catch(e){
							value = undefined;
						}
						me.field.setValue(value);
					}
					notifyFinishedCb();
				});
			});

			// 自适应发布助手提示条
			assistant.on('updateErrors', this.onAssistantChanged, this);
			assistant.on('clearErrors', this.onAssistantChanged, this);
			assistant.on('heightChanged', this.onAssistantChanged, this);
		},

		active: function(){
			var width = 1010;
			var height = document.documentElement.clientHeight - 32;
			if(assistant.hasError()){
				height -= assistant.height();
			}

			this.$tab.addClass('active');
			this.$panel.css('width', width + 'px').css('height', height + 'px');

			if(this.lastHeight !== height){
				this.lastHeight = height;
				this.trigger('resize');
			}
		},

		deactive: function(){
			this.$tab.removeClass('active');
			this.$panel.css('width', '0px').css('height', '0px');
		},

		id: function(){
			return this.model.get('id');
		},

		onResize: function(){
			log('NP - pluginResize >> ' + PLUGIN_ID);
			this.adapter.resizePlugin();
		},

		onSchemaChanged: function(){
			// 解开之前的事件连接
			if(this.field){
				this.field.off('focus', this.onFocus, this);
				this.field.off('hasError', this.onHasError, this);
				this.field.off('noError', this.onNoError, this);
			}

			this.field = as.schema.find(FIELD_ID);
			if(this.field){
				this.adapter.set(this.field.value());

				// 事件连接
				this.field.on('focus', this.onFocus, this);
				this.field.on('hasError', this.onHasError, this);
				this.field.on('noError', this.onNoError, this);
			}else{
				this.adapter.set('');
			}
		},

		onFocus: function(){
			this.model.active();
			as.util.twinkle(this.$tab);
		},

		onHasError: function(){
			this.$tab.addClass('has-error');
		},

		onNoError: function(){
			this.$tab.removeClass('has-error');
		},

		onAssistantChanged: function(){
			if(this.$panel.width() > 0){
				this.active();
			}
		}
	});

	//
	module.exports = TabItemView;
});