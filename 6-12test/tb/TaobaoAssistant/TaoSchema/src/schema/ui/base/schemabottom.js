/**
 * IN:
 * errors
 * reminders
 */

define(function(require, exports, module){
	//
	var Reminder = require('src/schema/ui/base/reminder');

	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'bottom',

		initialize: function(){
			this.model.on('errorAdded', this.onErrorAdded, this);
			this.model.on('errorChanged', this.onErrorChanged, this);
			this.model.on('errorRemoved', this.onErrorRemoved, this);
			this.errors = {};
		},

		render: function(){
			// 清空
			this.$el.empty();

			var me = this;
			// bottom的reminders
			var reminders = this.model.get('reminders');
			_.each(reminders, function(reminder){
				if(reminder.align !== 'bottom'){
					return;
				}

				var reminderView = new Reminder({model: reminder});
				reminderView.$el.attr('tag', 'reminder').addClass('reminder-bottom');
				reminderView.render();
				me.$el.append(reminderView.$el);
			});
		},

		onErrorAdded: function(name){
			log('add error >> ', name);
			this.updateError(name);
		},

		onErrorChanged: function(name){
			log('change error >> ', name);
			this.updateError(name);
		},

		onErrorRemoved: function(name){
			log('remove error >> ', name);
			var errorView = this.errors[name];
			if(errorView){
				errorView.$el.remove();
				delete this.errors[name];
			}
		},

		updateError: function(name){
			var error = _.find(this.model.get('errors'), function(error){
				return (error.name === name);
			});

			if(!_.isObject(error) || (error.host && error.host !== this)){
				return;
			}

			var errorView = this.errors[name];
			if(errorView){
				errorView.model.text = error.text;
				errorView.render();
				return;
			}

			var reminder = {align: 'right', level: 'error', mode: 'normal', text: error.text};
			var errorReminder = new Reminder({model: reminder});
			this.errors[name] = errorReminder; // cache
			error.host = this;	// 该错误已被消费

			errorReminder.box = this;
			errorReminder.maxWidth = this.leaveWidth();
			errorReminder.$el.addClass('reminder-bottom').attr('rule', name);
			errorReminder.render();
			this.$el.append(errorReminder.$el);
		},

		leaveWidth: function(){
			return this.$el.width();
		},
	});

	//
	module.exports = View;
});