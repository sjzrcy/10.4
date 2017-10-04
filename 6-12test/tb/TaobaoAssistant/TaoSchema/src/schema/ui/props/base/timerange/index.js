define(function(require, exports, module){
	//
	var DEFAULT_FORMAT = 'YYYY-MM-DD hh:mm:ss';
	var SPLIT = '至';

	//
	module.exports = Backbone.View.extend({
		tagName: 'div',
		className: 'prop-timerange',

		events: {
			"click input": function(){
				this.showDateWidget(event.srcElement);
			},

			"click label": function(){
				var $input = $(event.srcElement).siblings(':text');
				this.showDateWidget($input[0]);
			}
		},

		initialize: function(){
			this.model.on('valueUpdated', this.render, this);
			this.model.on('readonlyStatusChanged', this.render, this);

			this.config = {
				isclear: true, //是否显示清空
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

		render: function(){
			this.$el.empty();
			this.$el.append(this.renderStart());
			this.$el.append(this.renderEnd());
		},

		value: function(tag){
			var value = this.model.value();
			if(typeof(value) === 'string'){
				var index = value.indexOf(SPLIT);
				if(index !== -1){
					if(tag === 'start'){
						return value.substr(0, index);
					}else{
						return value.substr(index + 1);
					}
				}
			}
		},

		renderStart: function(){
			var $input = $('<input>').attr('placeholder', this.placeholder1).val(this.value('start'));
			if(this.model.isReadonly()){
				$input.prop('disabled', true);
			}

			var $el = $('<div class="range-start">');
			$el.append($input).append($('<label>'));

			return $el;
		},

		renderEnd: function(){
			var $text = $('<span class="splitter">').text('－');
			var $input = $('<input>').attr('placeholder', this.placeholder2).val(this.value('end'));
			if(this.model.isReadonly()){
				$input.prop('disabled', true);
			}
			
			var $el = $('<div class="range-end">');
			$el.append($text).append($input).append($('<label>'));

			return $el;
		},

		chooseHandle: function(){
			var me = this;
			var handle = function(dates){
				var start = me.$('.range-start input').val();
				var end = me.$('.range-end input').val();
				if(start && end){
					me.model.setValue(start + SPLIT + end);
				}else{
					me.model.setValue(undefined);
				}
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
			laydate(config);
		}
	});
});