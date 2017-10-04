/**
 * 
 一、核心方法：laydate(options);
    options是一个对象，它包含了以下key: '默认值'
        elem: '#id', //需显示日期的元素选择器
        event: 'click', //触发事件
        format: 'YYYY-MM-DD hh:mm:ss', //日期格式
        istime: true, //是否开启时间选择
        isclear: true, //是否显示清空
        istoday: true, //是否显示今天
        issure: true, 是否显示确认
        festival: true //是否显示节日
        min: '1900-01-01 00:00:00', //最小日期
        max: '2099-12-31 23:59:59', //最大日期
        start: '2014-6-15 23:00:00',    //开始日期
        fixed: false, //是否固定在可视区域
        zIndex: 99999999, //css z-index
        choose: function(dates){ //选择好日期的回调

        }
    
二、其它方法/属性

    laydate.v   //获取laydate版本号
    laydate.skin(lib);  //加载皮肤，参数lib为皮肤名
    layer.now支持多类型参数。timestamp可以是前后若干天，也可以是一个时间戳。format为日期格式，为空时则采用默认的“-”分割。
    如laydate.now(-2)将返回前天，laydate.now(3999634079890)将返回2096-09-28
    layer.now(timestamp, format);   //该方法提供了丰富的功能，推荐灵活使用。
    laydate.reset();    //重设日历控件坐标，一般用于页面dom结构改变时。无参

 * 输入参数：
 * format:
 * min:
 * max:
 * time：
 */

define(function(require, exports, module){
	//
	var DEFAULT_FORMAT = 'YYYY-MM-DD hh:mm:ss';

	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'asdate',

		events: {
			"click input": function(){
				this.showDateWidget();
			},

			"click label": function(){
				this.showDateWidget();
			}
		},

		initialize: function(){
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
			this.doWidth();
		},

		render: function(){
			// 清空
			this.$el.empty();

			var time = this.model.value();
			var $input = $('<input>').attr('placeholder', this.placeholder).val(time);
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

		doWidth: function(){
			var css = this.model.get('css');
			if(_.isObject(css) && css.width){
				this.$el.css('width', css.width);
			}
		},

		showDateWidget: function(){
			var config = _.extend({}, this.config);
			config.elem = this.$('input')[0];
			config.start = laydate.now(0, config.format);
			laydate(config);
		}
	});

	//
	module.exports = View;
});