/**
 * 自定义类目属性对话框
 * options[{value: , text:, needContentNumber: boolean }]
 * value([{value: , text:, content: }])
 * maxItems
 */

define(function(require, exports, module){
	//
	var BaseDialog = require('src/base/common/dialog/dialog');

	//
	var View = BaseDialog.extend({
		events: {
		},

		initialize: function(){
			BaseDialog.prototype.initialize.apply(this, arguments);
			this.$panel.addClass('prop-custom-panel');
		},

		render: function(){
			this.$panel.empty();
			$('body').append(this.$el);

			//传入参数校验
			this.validate();

			//提示
			this.$panel.append(this.renderTip());

			//表格
			this.$panel.append(this.renderTable());

			//提交之前的校验
			this.commitValidate();

			//错误信息
			this.$errors = $('<div class="customprops-errors">');
			this.$panel.append(this.$errors);
		},

		validate: function(){
			var maxItems = this.model.field.get('maxItems');
			if(!_.isNumber(maxItems)){
				maxItems = 10;
			}
			this.maxItems = maxItems;

			var namePropMaxLength = this.model.field.get('namePropMaxLength');
			if(!_.isNumber(namePropMaxLength)){
				namePropMaxLength = 10;
			}
			this.namePropMaxLength = namePropMaxLength;

			var valuePropMaxLength = this.model.field.get('valuePropMaxLength');
			if(!_.isNumber(valuePropMaxLength)){
				valuePropMaxLength = 20;
			}
			this.valuePropMaxLength = valuePropMaxLength;
		},

		renderTip: function(){
			return $('<div class="customprops-tip">').text('提示：最多添加' + this.maxItems + '组自定义属性');
		},

		renderTable: function(){
			var customProps = this.model.field.get('value');

			var $table = $('\
				<table class="customprops-options-table">\
					<tr>\
						<th>属性名（最多' + this.namePropMaxLength + '个字）</th>\
						<th>属性值（最多' + this.valuePropMaxLength + '个字）</th>\
					</tr>\
				</table>\
			');
			for(var i = 0; i < this.maxItems; i++){
				var $tr = $('<tr><td class="name"><input type="text"></input></td> <td class="value"><input type="text"></input></td></tr>');
				//填充数据
				if(_.isArray(customProps) && customProps.length > i){
					$('td.name input' ,$tr).val(customProps[i]['name']);
					$('td.value input' ,$tr).val(customProps[i]['value']);
				}
				$table.append($tr);
			}

			return $('<div class="table-wrap">').append($table);
		},

		commitValidate: function(){
			$('td.name input').attr('maxlength',this.namePropMaxLength);
			$('td.value input').attr('maxlength',this.valuePropMaxLength);
		},

		renderError: function(error){
			var $error = $('<div class="customprops-error">');
			$error.append($('<img src="../img/error.png"/>'));
			$error.append($('<span>').text(error));
			return $error;
		},

		updateErrors: function(errors){
			this.$errors.empty();
			for(var i = 0; i < errors.length; ++i){
				this.$errors.append(this.renderError(errors[i]));
			}

			if(errors.length === 0){
				this.$('.customprops-tip').show();
			}else{
				this.$('.customprops-tip').hide();
			}
		},

		getCustomProps: function(){
			var customProps = [];
			this.$('tr:gt(0)').each(function(i,e){
				var customProp = {};
				var $nameInput = $('td.name input', $(e));
				var $valueInput = $('td.value input', $(e));
				var nameInputValue = $nameInput.val();
				var valueInputValue = $valueInput.val();
				if(nameInputValue){
					nameInputValue = nameInputValue.trim();
					// nameInputValue = as.util.xssEncode(nameInputValue);
				}
				if(valueInputValue){
					valueInputValue = valueInputValue.trim();
					// valueInputValue = as.util.xssEncode(valueInputValue);
				}
				customProp.name = _.isUndefined(nameInputValue)? '': nameInputValue;
				customProp.value = _.isUndefined(valueInputValue)? '': valueInputValue;
				if(customProp.name && customProp.value){
					customProps.push(customProp);
				}
			});
			return customProps;
		}

	});

	//
	module.exports = View;
});