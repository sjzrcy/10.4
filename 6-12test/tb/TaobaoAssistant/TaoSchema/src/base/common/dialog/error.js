/**
 * 错误提示对话框
 */

define(function(require, exports, module){
	//
	var BaseDialog = require('src/base/common/dialog/dialog');

	// 支持两种错误，
	// 1.普通文本 
	// 2.结构化错误信息
	/*
	{fields:{
		id:{
			errorcode: msg,
			errorcode: msg,
			...
		},
		...
	},
	global:[{
		errorcode: msg,
	},{
	
	}]}
	*/
	var handleText = function(text){
		if(_.isObject(text)){
			// 字段错误
			var fieldsText = '';
			var fields = text.fields;
			if(_.isObject(fields)){
				_.each(fields, function(field, id){
					if(_.isArray(field) && field.length > 0){
						fieldsText += (id + ':<br/>');
						_.each(field, function(group){
							_.each(group, function(msg, code){
								fieldsText += ('&nbsp;&nbsp;' + msg + '(' + code + ')<br/>');
							});
						});
					}
				});
			}
			if(fieldsText){
				fieldsText = '字段错误：<br/>' + fieldsText + '<br/>';
			}

			// 全局错误
			var globalText = '';
			var globals = text.global;
			if(_.isArray(globals) && globals.length > 0){
				_.each(globals, function(global){
					_.each(global, function(msg, code){
						globalText += ('&nbsp;&nbsp;' + msg + '(' + code + ')<br/>');
					});
				});
			}
			if(globalText){
				globalText = '错误描述：<br/>' + globalText + '<br/>';
			}

			// 错误信息组装
			if(globalText || fieldsText){
				text = (fieldsText + globalText);
			}else{
				text = JSON.stringify(text);
			}
		}

		return text;
	};

	//
	var View = BaseDialog.extend({
		initialize: function(){
			BaseDialog.prototype.initialize.apply(this, arguments);
			this.text = handleText(this.model.text);
		},

		render: function(){
			var $panel = this.$panel;
			$panel.empty();
			$panel.append(this.renderText());
		},

		renderText: function(){
			var $text = $('<div class="error-text">').css({
				'min-height': '40px',
				'background-color': '#ffffff',
				'color': '#333333',
				'padding-top': '20px',
				'padding-left': '20px',
				'padding-right': '20px',
				'font-size': '14px',
				'word-break': 'break-all',
			}).html(this.text);
			return $text;
		}
	});

	//
	module.exports = View;
});