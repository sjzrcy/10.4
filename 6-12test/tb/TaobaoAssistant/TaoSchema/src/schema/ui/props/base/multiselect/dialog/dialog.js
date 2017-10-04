/**
 * 辅助枚举选择对话框
 * options
 * value([])
 */

define(function(require, exports, module){
	//
	var MIN_QUERY_COUNT = 20;

	//
	var BaseDialog = require('src/base/common/dialog/dialog');

	//
	var View = BaseDialog.extend({
		events: {
			'click :checkbox': function(){
				var $checkbox = $(event.srcElement);
				if($checkbox.attr('custom') === 'true'){
					this.onCustomCheckedStatusChanged($checkbox, true);
				}
			},

			'focus .custom-options :text': function(){
				var $input = $(event.srcElement);
				var $checkbox = $input.siblings(':checkbox');
				if(!$checkbox.prop('checked')){
					$checkbox.prop('checked', true);
					this.onCustomCheckedStatusChanged($checkbox, false);
				}
			},

			'blur .custom-options :text': function(){
				var $input = $(event.srcElement);
				var text = $input.val();
				if(text && this.isTextRepeat($input[0])){
					$input.val('');
					as.util.showErrorTip('自定义项不能重复！');
				}
			}
		},
		
		initialize: function(){
			BaseDialog.prototype.initialize.apply(this, arguments);
			this.$panel.addClass('prop-options-panel');

			this.isRenderSearch = this.model.options.length >= MIN_QUERY_COUNT;
			this.isRenderCustom = !!this.model.custom;
		},

		render: function(){
			var $panel = this.$panel;
			$panel.empty();

			if(this.isRenderSearch){
				$panel.append(this.renderSearch());
			}

			if(this.isRenderCustom){
				$panel.append(this.renderCustom());
			}

			$panel.append(this.renderOptions());

			// 显示
			$('body').append(this.$el);
		},

		selectedOptions: function(){
			var options = [];
			this.$(':checked').each(function(i ,e){
				var text;
				var $checkbox = $(e);
				if($checkbox.attr('custom')){
					text = $checkbox.siblings(':text').val();
				}else{
					text = $checkbox.siblings('.text').text();
				}

				if(text){
					options.push({
						value: $checkbox.data('value'), 
						text: text
					});
				}
			});

			return options;
		},

		renderSearch: function(){
			var $wrap = $('<div class="search-wrap">');
			this.$search = $('<input class="search" placeholder="输入您想查找的关键词"/>');
			this.$result = $('<div class="result-text">');
			$wrap.append(this.$search);
			$wrap.append(this.$result);

			var me = this;
			this.$search.bind('textchange', function(){
				me.onSearchTextChange();
			});

			return $wrap;
		},

		onSearchTextChange: function(){
			var text = this.$search.val();
			var count = this.findText(text, this.$('span.text'));
			this.$result.text(text? ('找到' + count + '个相关'): '');	
		},

		// 模拟CTRL + F
		findText: function(query, $items){
			var count = 0;
			$items.each(function(i, e){
				var $item = $(e);
				var text = $item.data('text');
				if(query && text.indexOf(query) != -1){
					count += 1;
					$item.html(text.replace(query, ('<span class="find-text-bg">' + query + '</span>')));
				}else{
					$item.text(text);
				}
			});

			return count;
		},

		renderCustom: function(){
			var customOptions = as.util.pickCustomOptions(this.model.value);

			var me = this;
			var $options = $('<div class="options custom-options clearfix">');
			_.each(customOptions, function(option){
				$options.append(me.renderCustomOption(option, true));
			});

			$options.append(this.renderCustomOption({value: -1, text: ''}, false));
			return $options;
		},

		renderCustomOption: function(option, isChecked){
			var $option = $('<div class="option float-left">');
			$option.append($('<input type="checkbox" custom="true">').prop('checked', isChecked).attr('value', option.value).data('value', option.value));
			$option.append($('<input type="text" placeholder="自定义">').val(option.text));

			return $option;
		},

		renderOptions: function(){
			var me = this;
			var $options = $('<div class="options normal-options clearfix">');
			$options.css({
				"max-height": "256px",
				"overflow-y": "auto"
			});
			
			var options = this.model.options;
			_.each(options, function(option){
				$options.append(me.renderOption(option, as.util.isOptionChecked(option, me.model.value)));
			});

			return $options;
		},

		renderOption: function(option, isChecked){
			var $option = $('<div class="option float-left">');
			$option.append($('<input type="checkbox">').prop('checked', isChecked).attr('value', option.value).data('value', option.value));
			$option.append($('<span class="text">').data('text', option.text).text(option.text));

			return $option;
		},

		onCustomCheckedStatusChanged: function($checkbox, isGetFocus){
			if($checkbox.prop('checked')){
				if(this.canAddMoreCustom()){
					this.$('.custom-options').append(this.renderCustomOption({value: -1, text: ''}, false));
				}
				if(isGetFocus){
					$checkbox.siblings(':text').focus();
				}
			}else{
				$checkbox.parent().remove();
				if(this.isAllCustomChecked()){
					this.$('.custom-options').append(this.renderCustomOption({value: -1, text: ''}, false));
				}
			}
		},

		canAddMoreCustom: function(){
			if(_.isObject(this.model.custom)){
				var maxItems = this.model.custom.maxItems;
				if(_.isNumber(maxItems)){
					return (this.customOptionCount() < maxItems);
				}
			}

			return true;
		},

		customOptionCount: function(){
			var count = 0;
			this.$('.custom-options :checkbox').each(function(i, e){
				count += 1;
			});

			return count;
		},

		isAllCustomChecked: function(){
			var isAllCustomChecked = true;
			this.$('.custom-options :checkbox').each(function(i, e){
				if(!$(e).prop('checked')){
					isAllCustomChecked = false;
					return false;
				}
			});

			return isAllCustomChecked;
		},

		isTextRepeat: function(input){
			var isRepeat = false;
			var text = $(input).val();
			this.$(':text').each(function(i, e){
				if(e !== input && $(e).val() === text){
					isRepeat = true;
					return false;
				}
			});

			return isRepeat;
		}
	});

	//
	module.exports = View;
});