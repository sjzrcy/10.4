/**
 * model: SchemaField
 * 单图
 */

define(function(require, exports, module){
	//
	var BaseView = require('src/schema/baseview');
	var Reminder = require('src/schema/ui/base/reminder');

	//
	var View = BaseView.extend({
		tagName: 'div',
		className: 'schema',

		events: {
			'click :checkbox': function(){
				var $checkbox = $(event.srcElement);
				if($checkbox.prop('checked')){
					this.setChecked();
				}else{
					this.setUnChecked();
				}
			}
		},

		initialize: function(){
			// 继承schema行为
			BaseView.prototype.initialize.apply(this, arguments);
			this.model.on('valueUpdated', this.render, this);
			this.option = this.model.get('options')[0];
		},

		render: function(){
			this.$el.empty();
			
			var $e = $('<div class="single-checkbox">');
			$e.append($('<input type="checkbox"/>').prop('checked', this.isChecked()));
			$e.append($('<span>').text(this.model.get('options')[0].text));

			// render reminder
			var reminders = this.model.get('reminders');
			if(_.isArray(reminders) && reminders.length > 0){
				_.each(reminders, function(reminder){
					if(reminder.mode === 'hover'){
						var view = new Reminder({model: reminder});
						view.render();
						view.$el.css({
							"display": "inline-block",
							"vertical-align": "middle"
						});
						$e.append(view.$el);
					}
				});
			} 

			this.$el.append($e);
		},

		isChecked: function(){
			var value = this.model.value();
			return (_.isArray(value) && value.length === 1 && this.option.value === value[0]);
		},

		setChecked: function(){
			this.model.setValue([this.option.value]);
		},

		setUnChecked: function(){
			this.model.setValue(undefined);
		}
	});

	//
	module.exports = View;
});