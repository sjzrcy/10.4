define(function(require, exports, module){
	//
	var Expression = require('src/schema/control/expression');

	//
	module.exports = Backbone.View.extend({
		tagName: 'div',
		className: 'prop-input',

		events: {
			'focus input': function(){
				var $input = this.$('input');
				if(this.inputTip && $input.val() === this.inputTip){
					$input.removeClass(this.TIP);
					$input.val('');
				}
			},

			'blur input': function(){
				var $input = this.$('input');
				var value = as.util.trimedValue($input);
				if(this.last !== value){
					this.last = value;
					this.model.setValue(value);
				}

				if(this.inputTip && !value){
					$input.addClass(this.TIP);
					$input.val(this.inputTip);
				}
			}
		},

		initialize: function(){
			// data
			this.offCbs = [];
			this.afterRenderCbs = [];

			// readonly
			this.model.on('readonlyStatusChanged', this.render, this);
			this.model.on('valueUpdated', this.render, this);
			this.model.on('autoValueStatusChanged', this.handleAutoValue, this);

			//
			this.doInputReminder();
		},

		doInputReminder: function(){
			// 只取第一个input提示
			var text = '';
			_.find(this.model.get('reminders'), function(reminder){
				if(reminder.mode === 'input'){
					text = reminder.text;
					return true;
				}
			});

			this.placeholder = text;
		},

		render: function(){
			//
			this.$el.empty();

			//
			this.last = this.model.value();
			var $input = $('<input>').attr('placeholder', this.placeholder).attr('id', this.model.id).val(this.last);
			$input.prop('disabled', this.model.isReadonly()); // readonly
			$input.bind('textchange',  this.model, this.model.dispatch); // 向上抛出信号
			this.$el.append($input);

			var unit = this.model.get('unit');
			if(unit){
				var $unit = $('<div class="unit">').text(unit);
				var unitWidth = (as.util.measureText(unit)).width + 4;
				$unit.css('left', 'calc(100% - ' + unitWidth + 'px)');
				$input.css('padding-right', unitWidth + 'px').css('width', 'calc(100% - ' + unitWidth + 'px)');
				this.$el.append($unit);
			}

			// 渲染之后
			this.onAfterRender();
		},

		registerAfterRenderCb: function(cb){
			if(this.afterRenderCbs.indexOf(cb) === -1){
				this.afterRenderCbs.push(cb);	
			}
		},

		onAfterRender: function(){
			for(var i = 0; i < this.afterRenderCbs.length; ++i){
				var cb = this.afterRenderCbs[i];
				if(_.isFunction(cb)){
					cb();
				}
			}
		},

		handleAutoValue: function(){
			var action = 'autoValue';
			var autoValue = this.model.getActionStatus(action);
			if(!_.isString(autoValue)){
				return;
			}

			// 不管有或者没有，先移除掉先前的连接
			this.clearOffCb();
			this.exp = undefined;

			//bind 监听依赖项
			if(autoValue.length > 0){ 
				var exp = new Expression(autoValue);
				var depends = exp.depends();
				var me = this;
				_.each(depends, function(depend){
					depend = depend.substr(1);
					var field = as.schema.find(depend);
					if(field){
						field.on('valueChanged', me.autoSetValue, me);
						me.pushOffCb(function(){
							field.off('valueChanged', me.autoSetValue, me);
							log('off valueChanged >>', field.id);
						});
					}
				});

				this.exp = exp;
			}else{
				// 恢复自动计算之前的值，如果之前没有设置过，则保持不变
				if(!_.isUndefined(this.last)){
					this.$(':text').val(this.last);
					this.model.setValue(this.last);
				}
			}
		},

		autoSetValue: function(){
			if(this.exp){
				var autoValue = this.exp.caculate();
				this.$(':text').val(autoValue);
				this.model.setValue(autoValue, true);

				log('autoSetValue >>', this.model.id, ' => ', autoValue);
			}
		},

		pushOffCb: function(cb){
			this.offCbs.push(cb);
		},

		clearOffCb: function(){
			for(var i = 0; i < this.offCbs.length; ++i){
				var cb = this.offCbs[i];
				if(_.isFunction(cb)){
					cb();
				}
			}

			this.offCbs = [];
		}
	});
});