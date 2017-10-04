/**
 * IN:
 * title
 * must
 * reminders
 * customs [{model, view}]
 */

define(function(require, exports, module) {
    //
    var Reminder = require('src/schema/ui/base/reminder');
    var TextCounter = require('src/schema/ui/base/textcounter');
    var Sample = require('src/schema/ui/base/sample');

    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'top',

        initialize: function() {
            this.model.on('hasError', this.onHasError, this);
            this.model.on('noError', this.onNoError, this);
            this.model.on('focus', this.onFocus, this);
            this.model.on('actionReminderChanged', this.onActionReminderChanged, this);

            if (!this.model.get('forbidTopError')) {
                this.model.on('errorAdded', this.onErrorAdded, this);
                this.model.on('errorChanged', this.onErrorChanged, this);
                this.model.on('errorRemoved', this.onErrorRemoved, this);
            }

            this.errors = {};
            this.left = undefined;
            this.right = undefined;
            this.hasCounter = false;
        },

        render: function() {
            // 清空
            this.$el.empty();

            // title
            var $must = $('<div>').addClass('must').text('*').css('visibility', (this.model.get('must') ? 'visible' : 'hidden'));
            this.$el.append($must);

            var $title = $('<div>').addClass('title').text(this.model.get('title'));
            this.$el.append($title);

            // 取第一个left，暂只支持一个(且字数要控制)
            var reminders = this.model.get('reminders');
            var leftReminder = _.find(reminders, function(reminder, index, list) {
                return (reminder.align === 'left');
            });
            if (leftReminder) {
                var leftReminderView = new Reminder({ model: leftReminder });
                leftReminderView.render();
                leftReminderView.$el.addClass('reminder-left');
                this.$el.append(leftReminderView.$el);
            }

            // text-counter 最右边
            if (this.model.get('counter') && this.model.get('maxLength')) {
                this.hasCounter = true;
                var maxLength = this.model.get('maxLength');
                var value = this.model.value();
                var currentLength = value ? as.util.bytes(value) : 0;
                var textCounter = new TextCounter({ model: { 'maxLength': maxLength, 'currentLength': currentLength } });
                this.model.on('textchange', textCounter.handle());
                textCounter.render();
                this.$el.append(textCounter.$el);
            }

            // 取第一个right，暂只支持一个 -- 倒数第二右边
            var rightReminder = _.find(reminders, function(reminder) {
                return (reminder.align === 'right' && reminder.mode !== 'input');
            });
            if (rightReminder) {
                var rightReminderView = new Reminder({ model: rightReminder });
                rightReminderView.render();
                rightReminderView.$el.addClass('reminder-right');
                this.$el.append(rightReminderView.$el);
            }

            // samples
            var samples = this.model.get('sample');
            if (_.isArray(samples)) {
                var me = this;
                _.each(samples, function(sample, index, list) {
                    sample = list[list.length - (index + 1)];
                    var view = new Sample({ model: sample });
                    view.render();
                    me.$el.append(view.$el);
                });
            }
        },

        updateError: function(name) {
            var error = _.find(this.model.get('errors'), function(error) {
                return (error.name === name);
            });
            if (!_.isObject(error) || (error.host && error.host !== this)) {
                return;
            }

            var errorView = this.errors[name];
            if (errorView) {
                errorView.maxWidth = this.leaveWidth(errorView.el);
                errorView.model.text = error.text;
                errorView.render();
                return;
            }

            // top只处理一条错误
            if (!_.isEmpty(this.errors)) {
                return;
            }

            var reminder = { align: 'right', level: 'error', mode: 'normal', text: error.text };
            var errorReminder = new Reminder({ model: reminder });
            this.errors[name] = errorReminder; // cache
            error.host = this; // 标记该错误宿主

            errorReminder.box = this;
            errorReminder.maxWidth = this.leaveWidth();
            errorReminder.$el.addClass('reminder-right').attr('rule', name);
            errorReminder.render();
            this.$el.append(errorReminder.$el);
        },

        onFocus: function() {
            var $title = this.$('.title');
            as.util.scrollTo($title[0]);
            as.util.twinkle($title);
        },

        onErrorAdded: function(name) {
            if (name.indexOf('checkitem') === -1) {
                log('error add >> ' + name);
                this.updateError(name);
            }
        },

        onErrorChanged: function(name) {
            log('error change >> ' + name);
            this.updateError(name);
        },

        onErrorRemoved: function(name) {
            var errorView = this.errors[name];
            if (errorView) {
                errorView.$el.remove();
                delete this.errors[name];
            }
        },

        leaveWidth: function(target) {
            var total = this.$el.width();
            var current = 0;
            var children = this.$el.children();
            _.each(children, function(domChild) {
                if (target === domChild) {
                    return;
                }

                var $child = $(domChild);
                var width = $child.width();
                width += as.util.numberOfPx($child.css('margin-left'));
                width += as.util.numberOfPx($child.css('margin-right'));
                current += width;
            });

            return (total - current);
        },

        onHasError: function() {
            this.$('.title').addClass('has-error');
        },

        onNoError: function() {
            this.$('.title').removeClass('has-error');
        },

        onActionReminderChanged: function(name, value) {
            this.$('.action-reminder').remove();
            if (_.isObject(value)) {
                var view = new Reminder({ model: value });
                view.render();
                view.$el.addClass('reminder-left action-reminder');
                view.$el.insertAfter(this.$('.title'));
            }
        }
    });

    //
    module.exports = View;
});
