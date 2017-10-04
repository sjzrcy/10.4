/*
度量衡
sku时间点
*/
define(function(require, exports, module){
	var DEFAULT_FORMAT = 'YYYY-MM-DD hh:mm:ss';

	module.exports = Backbone.View.extend({
		tagName: 'div',
		className: 'sku-datetime',

		events: {
			'click .time-item :checkbox': function(){
				var $checkbox = $(event.srcElement);
				if($checkbox.prop('checked')){
					this.$el.append(this.renderEmptyItem());
				}else{
					this.removeValue($checkbox.siblings(':text').data('value'));
					$checkbox.parent().remove();
				}
			},

			'click .time-item :text': function(){
				var $input = $(event.srcElement);
				var $checkbox = $input.siblings(':checkbox');
				if(!$checkbox.prop('checked')){
					$checkbox.prop('checked', true);
					this.$el.append(this.renderEmptyItem());
				}

				this.showDateWidget(event.srcElement);
			}
		},

		initialize: function(){
			this.MIN = 0;
			this.config = {
				isclear: false, //是否显示清空
				istoday: true, //是否显示今天
				issure: true, //是否显示确认
				festival: true, //是否显示节日，默认不显示
				choose:  this.chooseHandle()//日期选择完成时的回调
			};

			// 处理最小值
			if(this.model.get('min') === 'now'){
				this.config.min = (new Date()).format('yyyy-MM-dd hh:mm:ss');
			}

			// 处理时间格式，以及是否显示时间
			var format = this.model.get('format');
			this.config.format = (format? format: DEFAULT_FORMAT);
			this.config.istime = (this.config.format.indexOf('hh') !== -1);

			// 样式
			this.doInputReminder();
		},

		doInputReminder: function(){
			// 只取第一个input提示
			var me = this;
			_.find(this.model.get('reminders'), function(reminder){
				if(reminder.mode === 'input'){
					me.placeholder = reminder.text;
				}
			});

			if(!this.placeholder){
				this.placeholder = '请选择';
			}
		},

		render: function(){
			this.$el.empty();

			var value = this.model.value();
			if(value && _.isArray(value)){
				var me = this;
				_.each(value, function(item){
					me.$el.append(me.renderItem(item));
				});
			}

			this.$el.append(this.renderEmptyItem());
		},

		renderItem: function(option){
			if(Number(option.value) < this.MIN){
				this.MIN = Number(option.value);
			}

			var $checkbox = $('<input type="checkbox">').prop('checked', !!(option.value && option.text));
			var $input = $('<input type="text">').data('value', option.value).val(option.text);
			if(this.placeholder){
				$input.attr('placeholder', this.placeholder);
			}

			return $('<div class="time-item">').append($checkbox).append($input).append($('<label>'));
		},

		renderEmptyItem: function(){
			return this.renderItem({value: Number(this.MIN -= 1).toString(), text: ''});
		},

		chooseHandle: function(input){
			var me = this;
			var handle = function(dates){
				me.update(input, dates);
			};
			return handle;
		},

		showDateWidget: function(input){
			var config = _.extend({}, this.config);
			config.elem = input;
			config.start = laydate.now(0, config.format);
			config.choose = this.chooseHandle(input);
			laydate(config);
		},

		// 删除，新增，更新
		update: function(input, dates){
			var $input = $(input);
			if(this.isRepeat(dates, $input)){
				$input.val('');
				dates = '';
				as.util.showErrorTip('时间点不允许重复');
			}

			var vid = $input.data('value');
			if(!dates){
				this.removeValue(vid);
				return;
			}

			var index = this.index(vid);
			if(index !== undefined){
				var value = this.model.value();
				value[index].text = dates;
				this.model.setValue(value);
			}else{
				this.insert(input, {value: vid, text: dates});
			}
		},

		insert: function(input, option){
			var $item = $(input).parent();
			var index = $item.index();
			var validCount = 0;
			$item.siblings().each(function(i, e){
				if(i >= index){
					return false;
				}
				if($(':text', $(e)).val()){
					validCount += 1;
				}
			});

			var value = this.model.value();
			if(value && _.isArray(value)){
				value.splice(validCount, 0, option);
			}else{
				value = [option];
			}

			this.model.setValue(value);
		},

		removeValue: function(vid){
			var index = this.index(vid);
			if(index !== undefined){
				var value = this.model.value();
				value.splice(index, 1);
				this.model.setValue(value);
			}
		},

		index: function(vid){
			var findIndex;
			var value = this.model.value();
			if(value && _.isArray(value)){
				_.find(value, function(option, index){
					if(vid === option.value){
						findIndex = index;
						return true;
					}
				});
			}

			return findIndex;
		},

		isRepeat: function(text, $input){
			var isRepeat = false;
			$input.parent().siblings().each(function(i, e){
				var $brotherInput = $(':text', $(e));
				if($input[0] !== $brotherInput[0] && text && $brotherInput.val() === text){
					isRepeat = true;
					return false;
				}
			});

			return isRepeat;
		}
	});
});