/**
 * 
 */

define(function(require, exports, module){
	//
	var Reminder = require('src/schema/ui/base/reminder');

	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'asmultiselect',

		events: {
			"click :checkbox": function(){
				var values = [];
				var isProp = this.model.isProp();
				this.$(':checkbox').each(function(){
					var $checkbox = $(this);
					if($checkbox.prop('checked')){
						var value = $checkbox.data('value');
						var text = $checkbox.siblings('.text').text();
						values.push(isProp? {'value': value, 'text': text}: value);
					}
				});
				this.model.setValue(values);
			}
		},

		initialize: function(){
			this.model.on('valueUpdated', this.render, this);
			this.model.on('readonlyStatusChanged', this.render, this);
		},

		render: function(){
			// 清空
			this.$el.empty();

			//
			var me = this;
			var value = this.model.value();
			var isProp = this.model.isProp();
			var isReadonly = this.model.isReadonly();

			var options = this.model.get('options');
			_.each(options, function(option){
				var $option = $('<div class="option-v clearfix">');
				var $checkbox = $('<input type="checkbox">').data('value', option.value).addClass('checkbox');
				var isChecked;
				if(isProp){
					isChecked = (function(option, selectedOptions){
						if(_.isArray(selectedOptions)){
							for(var i = 0; i < selectedOptions.length; ++i){
								if(_.isObject(selectedOptions[i]) && selectedOptions[i].value === option.value){
									return true;
								}
							}
						}
					})(option, value);
				}else{
					isChecked = (_.isArray(value) && value.indexOf(option.value) !== -1);
				}
				$checkbox.prop('checked', isChecked === true).prop('disabled', isReadonly);
				var $text = $('<span class="text">').text(option.text);
				$option.append($checkbox).append($text);

				// reminder
				var reminders = option.reminder;
				if(!_.isArray(reminders) && _.isObject(reminders)){
					reminders = [reminders];
				}
				if(_.isArray(reminders)){
					_.each(reminders, function(reminder){
						var view = new Reminder({model: reminder});
						view.render();
						view.$el.removeClass('clearfix').addClass('float-left');
						$option.append(view.$el);
					});
				}

				me.$el.append($option);
			});
		}
	});

	//
	module.exports = View;
});