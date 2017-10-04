/**
 * model
 */

define(function(require, exports, module){
	//
	var ReminderView = require('src/schema/ui/base/reminder');

	//
	var View = Backbone.View.extend({
		tagName: 'div',
		className: 'prop-left clearfix',

		initialize: function(){
			this.model.on('hasError', this.onHasError, this);
			this.model.on('noError', this.onNoError, this);
			this.model.on('focus', this.onFocus, this);
		},

		render: function(){
			// title
			var title = this.model.get('title');
			var $title = $('<div class="prop-title">').text(title).css('padding-right', '10px');
			this.$el.append($title);

			// must
			var isMust = this.model.get('must');
			if(isMust){
				var $must = $('<span class="must">*&nbsp;</span>');
				this.$el.append($must);
			}

			// reminder left&&hover
			var reminder = _.find(this.model.get('reminders'), function(reminder){
				return (reminder.align === 'left' && reminder.mode === 'hover');
			});
			if(reminder){
				var reminderView = new ReminderView({model: reminder});
				reminderView.$el.addClass('prop-reminder');
				reminderView.render();
				this.$el.append(reminderView.$el);
			}
		},

		onFocus: function(){
			var $title = this.$('.prop-title');
			as.util.twinkle($title);
		},

		onHasError: function(){
			this.$('.prop-title').addClass('has-error');
		},

		onNoError: function(){
			this.$('.prop-title').removeClass('has-error');
		}
	});

	//
	module.exports = View;
});