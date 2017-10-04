define(function(require, exports, module){
	//
	var DEFAULT_FORMAT = 'YYYY-MM-DD hh:mm:ss';
	var SPLIT = '至';

	//
	module.exports = Backbone.View.extend({
		tagName: 'div',
		className: 'sku-timerange',

		events: {
			"click :checkbox": function(){
				var $checkbox = $(event.srcElement);
				if(!$checkbox.prop('checked')){
					this.removeValue($checkbox.data('value'));
					$checkbox.parent().remove();
				}else{
					this.$el.append(this.renderEmptyItem());
				}
			},

			"click :text": function(){
				var $checkbox = $(event.srcElement).parent().parent().siblings(':checkbox');
				if(!$checkbox.prop('checked')){
					$checkbox.prop('checked', true);
					this.$el.append(this.renderEmptyItem());
				}

				this.showDateWidget(event.srcElement);
			},

			"click .timerange-item .time-range label": function(){
				var $checkbox = $(event.srcElement).parent().parent().siblings(':checkbox');
				if(!$checkbox.prop('checked')){
					$checkbox.prop('checked', true);
					this.$el.append(this.renderEmptyItem());
				}

				var $input = $(event.srcElement).siblings(':text');
				this.showDateWidget($input[0]);
			}
		},

		initialize: function(){
			this.MIN = 0;
			this.config = {
				isclear: false, //是否显示清空
				istoday: true, //是否显示今天
				issure: true, //是否显示确认
				festival: true //是否显示节日，默认不显示
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

		render: function(){
			this.$el.empty();

			var value = this.model.value();
			if(value && _.isArray(value)){
				var me = this;
				_.each(value, function(option){
					me.$el.append(me.renderItem(option));
				});
			}

			this.$el.append(this.renderEmptyItem());
		},

		renderItem: function(option){
			if(Number(option.value) < this.MIN){
				this.MIN = Number(option.value);
			}

			var $checkbox = $('<input type="checkbox">').data('value', option.value)
								.prop('checked', !!(option.value && option.text));

			var $range = $('<div class="time-range">');
			$range.append(this.renderStart(option.text));
			$range.append(this.renderEnd(option.text));

			var $item = $('<div class="timerange-item">');
			$item.append($checkbox).append($range);

			return $item;
		},

		renderEmptyItem: function(){
			return this.renderItem({value: Number(this.MIN -= 1).toString(), text: ''});
		},

		renderStart: function(text){
			var $input = $('<input>').attr('placeholder', this.placeholder1).val(this.getSubText('start', text));
			var $icon = $('<label>');

			var $el = $('<div class="range-start">');
			$el.append($input).append($icon);

			return $el;
		},

		renderEnd: function(text){
			var $text = $('<span class="splitter">').text('－');
			var $input = $('<input>').attr('placeholder', this.placeholder2).val(this.getSubText('end', text));
			var $icon = $('<label>');
			
			var $el = $('<div class="range-end">');
			$el.append($text).append($input).append($icon);

			return $el;
		},

		chooseHandle: function(input){
			var me = this;
			var handle = function(dates){
				me.update(input, dates);
			};

			return handle;
		},

		doInputReminder: function(){
			// 只取第一个input提示
			var me = this;
			_.find(this.model.get('reminders'), function(reminder){
				if(reminder.mode === 'input'){
					if(!me.placeholder1){
						me.placeholder1 = reminder.text;
					}else if(!me.placeholder2){
						me.placeholder2 = reminder.text;
						return true;
					}
				}
			});

			// 默认提示
			if(!me.placeholder1){
				me.placeholder1 = '开始时间';
			}
			if(!me.placeholder2){
				me.placeholder2 = '结束时间';
			}
		},

		showDateWidget: function(input){
			var config = _.extend({}, this.config);
			config.elem = input;
			config.start = laydate.now(0, config.format);
			config.choose = this.chooseHandle(input);

			laydate(config);
		},

		getSubText: function(tag, text){
			if(typeof(text) === 'string'){
				var index = text.indexOf(SPLIT);
				if(index !== -1){
					if(tag === 'start'){
						return text.substr(0, index);
					}else{
						return text.substr(index + 1);
					}
				}
			}
		},

		getText: function($range){
			var start = $('.range-start :text', $range).val();
			var end = $('.range-end :text', $range).val();
			return (start + SPLIT + end);
		},

		isCompleted: function($range){
			var $start = $('.range-start :text', $range);
			var $end = $('.range-end :text', $range);
			return ($start.val() && $end.val());
		},

		isRepeat: function($range){
			var isRepeat = false;
			var text = this.getText($range);
			var me = this;
			var $current = $range.parent();
			$current.siblings().each(function(i, e){
				if(me.getText($('.time-range', $(e))) === text){
					isRepeat = true;
					return false;
				}
			});

			return isRepeat;
		},

		update: function(input, dates){
			var $input = $(input);
			var $range = $input.parent().parent();
			var vid = $range.siblings(':checkbox').data('value');

			// 判断完整性
			if(!this.isCompleted($range)){
				this.removeValue(vid);
				return;
			}

			// 判断重复性
			if(this.isRepeat($range)){
				$input.val('');
				dates = '';
				as.util.showErrorTip('不允许重复的时间区间');
			}

			// 删除
			if(!dates){
				this.removeValue(vid);
				return;
			}

			// 插入、更新
			var index = this.index(vid);
			var text = this.getText($range);
			if(index !== undefined){
				var value = this.model.value();
				value[index].text = text;
				this.model.setValue(value);
			}else{
				this.insert($range, {value: vid, text: text});
			}
		},

		index: function(vid){
			var findIndex;
			var value = this.model.value();
			if(value && _.isArray(value)){
				_.find(value, function(option, index){
					if(option.value === vid){
						findIndex = index;
						return true;
					}
				});	
			}

			return findIndex;
		},

		removeValue: function(vid){
			var index = this.index(vid);
			if(index !== undefined){
				var value = this.model.value();
				value.splice(index, 1);
				this.model.setValue(value);
			}
		},

		insert: function($range, option){
			var $item = $range.parent();
			var index = $item.index();
			var validCount = 0;
			var me = this;
			$item.siblings().each(function(i, e){
				if(i >= index){
					return false;
				}
				if(me.isCompleted($('.time-range', $(e)))){
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
		}
	});
});