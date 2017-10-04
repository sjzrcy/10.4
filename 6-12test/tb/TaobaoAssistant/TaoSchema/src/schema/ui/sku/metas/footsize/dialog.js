/*
* ui:{包含渲染的元数据}
{
	footType: {
		tip: '',
		advise:[
		{
			img:
			text:
			options:

		},
		...
		],
		note: {
			tip:
			maxLength:
		}
	},
	footMeasureMethod:{
		tip:'',
		img: '',
		texts: ''
	}
}
* 
value: {
	footType:{
		isShow: boolean,
		footTypeAdvise: [text1, text2, ..., textN],
		footTypeNote: text,
	}

	footMeasureMethod:{
		isShow: boolean
	}
}
*/
define(function(require, exports, module){
	//
	var BaseDialog = require('src/base/common/dialog/dialog');

	//
	var View = BaseDialog.extend({
		initialize: function(){
			BaseDialog.prototype.initialize.apply(this, arguments);
			this.$panel.addClass('foot-size-dialog');
		},

		render: function(){
			this.$panel.empty();

			this.renderPanel();
			this.$('.content').css('width', '759px');
			this.$('.dialog').css('width', '761px');

			this.$el.appendTo($('body'));
		},

		renderPanel: function(){
			this.$panel.append(this.renderFootCheckbox());
			this.$panel.append(this.renderFootImages());
			this.$panel.append(this.renderFootNote());
			this.$panel.append(this.renderMeasureMethod());
		},

		renderFootCheckbox: function(){
			var me = this;
			var isChecked = function(){
				var value = me.model.value;
				return (_.isObject(value) && _.isObject(value.footType) && value.footType.isShow);
			};

			var tip = this.model.ui.footType.tip;
			tip = '添加后，消费者将在宝贝详情中看到以下图片和文字';
			var html = '<div class="add-foot-image"><input type="checkbox" id="footType.isShow"/>脚型图<span>' + tip + '</span></div>';
			var $option = $(html);

			$(':checkbox', $option).prop('checked', isChecked());
			return $option;
		},

		renderFootImages: function(){
			var advise = this.model.ui.footType.advise;
			var $panel = $('<div class="advise-image-panel clearfix">');
			var me = this;
			_.each(advise, function(option, index){
				$panel.append(me.renderFootImage(option, index));
			});

			return $panel;
		},

		/* img, text, options */
		renderFootImage: function(option, index){
			var me = this;
			var getValue = function(index, option){
				var optionValue;
				var value = me.model.value;
				if(_.isObject(value) && _.isObject(value.footType) 
					&& _.isArray(value.footType.footTypeAdvise)
					&& value.footType.footTypeAdvise.length > index){
					optionValue = value.footType.footTypeAdvise[index];
				}

				if(_.isUndefined(optionValue)){
					optionValue = option.options[0];
				}

				return optionValue;
			};

			var $image = $('<div class="image">').css('background-image', 'url(' + option.img + ')');
			var $text = $('<div class="text">').text(option.text);
			
			var value = getValue(index, option);
			var $select = $('<select>').click(function(){
				// 因为默认select，点击选项时计算坐标和普通元素不一致，这里禁止冒泡，以不做计算
				return false;
			});
			for(var i = 0; i < option.options.length; ++i){
				var text = option.options[i];
				var $option = $('<option>').attr('value', text).text(text);
				if(value === text){
					$option.prop('selected', true);
				}
				$select.append($option);
			}

			return ($('<div class="foot-option">').append($image).append($text).append($select));
		},

		renderFootNote: function(){
			var me = this;
			var getNote = function(){
				var value = me.model.value;
				if(_.isObject(value) && _.isObject(value.footType)){
					return value.footType.footTypeNote
				}else{
					return '';
				}				
			};

			var tip = this.model.ui.footType.note.placeholder;
			var html = '<div class="foot-note">备注：&nbsp;<input type="text" placeholder="' + tip + '"/></div>';
			var $note = $(html);
			$(':text', $note).val(getNote());
			return $note;
		},

		renderMeasureMethod: function(){
			var me = this;
			var isChecked = function(){
				var value = me.model.value;
				return (_.isObject(value) && _.isObject(value.footMeasureMethod) && value.footMeasureMethod.isShow);
			};

			// checkbox
			var measureMethod = this.model.ui.footMeasureMethod;
			var tip = measureMethod.tip;
			tip = '添加后，消费者将在宝贝详情中看到以下图片和文字';
			var html = '<div class="add-measure-mthod-image"><input type="checkbox" id="footMeasureMethod.isShow"/>测量方法图<span>' + tip + '</span></div>';
			var $option = $(html);
			$(':checkbox', $option).prop('checked', isChecked());

			// detail
			var $detail = $('<div class="measure-detail clearfix">');
			$detail.append($('<div class="measure-method-image">').css('background-image', 'url(' + measureMethod.img + ')'));

			var $texts = $('<div class="method-texts">');
			for(var i = 0; i < measureMethod.texts.length; ++i){
				var text = measureMethod.texts[i];
				var $text = $('<div class="method-text">').text(text);
				$texts.append($text);
			}
			$detail.append($texts);

			return $('<div class="method-panel">').append($option).append($detail);
		},

		// 收集页面上所有的值
		value: function(){
			var footTypeAdvise = [];
			this.$('.advise-image-panel select').each(function(i, e){
				footTypeAdvise.push($(e).val());
			});

			return ({
				footType: {
					isShow: this.$('.add-foot-image :checkbox').prop('checked'),
					footTypeAdvise: footTypeAdvise,
					footTypeNote: this.$('.foot-note :text').val()
				},

				footMeasureMethod:{
					isShow: this.$('.add-measure-mthod-image :checkbox').prop('checked')
				}
			});
		}
	});

	//
	module.exports = View;
});