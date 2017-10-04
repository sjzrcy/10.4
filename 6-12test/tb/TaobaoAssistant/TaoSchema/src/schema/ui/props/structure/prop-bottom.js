/**
 * 
 */

define(function(require, exports, module) {
    //
    var ReminderView = require('src/schema/ui/base/reminder');

    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'prop-bottom',

        initialize: function() {
            // 错误VIEW集合
            this.errors = {};

            this.model.on('reminderChanged', this.render, this);
            this.model.on('errorAdded', this.onErrorAdded, this);
            this.model.on('errorRemoved', this.onErrorRemoved, this);
        },

        render: function() {
            this.$el.empty();

            // reminders normal
            var me = this;
            _.each(this.model.get('reminders'), function(reminder) {
                if (reminder.mode === 'normal') {
                    var view = new ReminderView({ model: reminder });
                    view.$el.addClass('prop-reminder');
                    view.render();
                    me.$el.append(view.$el);
                }
            });
        },

        onErrorAdded: function(name) {
            var error = this.findError(this.model.get('errors'), name);
            if (!error) {
                return;
            }

            var lastView = this.errors[name];
            if (lastView) {
                lastView.text = error.text;
                lastView.render();
                return;
            }

            var reminder = { align: 'bottom', level: 'error', mode: 'normal', text: error.text };
            var view = new ReminderView({ model: reminder });
            this.errors[name] = view;

            view.box = this;
            view.maxWidth = this.leaveWidth();
            view.$el.addClass('prop-reminder').attr('rule', name);
            view.render();

            this.$el.append(view.$el);
        },

        onErrorRemoved: function(name) {
            var lastView = this.errors[name];
            delete this.errors[name];
            lastView.$el.remove();
        },

        findError: function(errors, name) {
            return (_.find(errors, function(error) {
                return (error.name === name);
            }));
        },

        leaveWidth: function() {
            return this.$el.width();
        }
    });

    //
    module.exports = View;
});
