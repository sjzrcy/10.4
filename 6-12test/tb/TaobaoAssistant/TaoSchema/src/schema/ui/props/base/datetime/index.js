define(function(require, exports, module){
	//
	var DEFAULT_FORMAT = 'YYYY-MM-DD hh:mm:ss';

	//
	module.exports = Backbone.View.extend({
		tagName: 'div',
		className: 'prop-datetime',

		events: {
			"click input": function(){
				this.showDateWidget();
			},

			"click label": function(){
				this.showDateWidget();
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
			// 清空
			this.$el.empty();

			var time = this.model.value();
			var $input = $('<input>').attr('placeholder', this.placeholder).val(time);
			if(this.model.isReadonly()){
				$input.prop('disabled', true);
			}

			var $icon = $('<label>');
			this.$el.append($input).append($icon);
		},

		chooseHandle: function(){
			var me = this;
			var handle = function(dates){
				me.model.setValue(dates);
			};
			return handle;
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

		showDateWidget: function(){
			var config = _.extend({}, this.config);
			config.elem = this.$('input')[0];
			config.start = laydate.now(0, config.format);
			laydate(config);
		}
	});
});