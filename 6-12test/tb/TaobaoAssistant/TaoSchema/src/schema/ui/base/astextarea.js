/**
 * 他的model需要提供如下状态：
 * 1. isInputable
 * 2. value
 * 3. options
 * 4. readonly
 * 5. disable
 * 6. must
 */

define(function(require, exports, module) {
    //
    var AsInput = Backbone.View.extend({
        tagName: 'textarea',
        className: 'content astextarea',

        events: {
            'focus': function() {
                if (this.inputTip && this.$el.val() === this.inputTip) {
                    this.$el.removeClass(this.TIP);
                    this.$el.val('');
                }
            },

            'blur': function() {
                var value = as.util.trimedValue(this.$el);
                if (this.last !== value) {
                    this.model.setValue(value);
                    this.last = value;
                }

                if (this.inputTip && !value) {
                    this.$el.addClass(this.TIP);
                    this.$el.val(this.inputTip);
                }
            },
        },

        initialize: function() {
            //
            this.TIP = 'astextarea-tip';

            //
            this.model.on('readonlyStatusChanged', this.render, this);
            this.model.on('disableStatusChanged', this.render, this);

            // 向上传递 
            this.$el.bind('textchange', this.model, this.model.dispatch);

            // 输入框内提示 
            this.doInputReminder();
        },

        render: function() {
            // 清空
            this.$el.empty();

            var value = this.model.value();
            this.last = value;
            if (_.isUndefined(value) && this.inputTip) {
                this.$el.addClass(this.TIP);
                this.$el.val(this.inputTip);
            } else {
                this.$el.val(value);
            }

            var isReadonly = this.model.isReadonly();
            this.$el.prop('disabled', isReadonly);

            var READONLY = 'astextarea-readonly';
            if (isReadonly) {
                if (!this.$el.hasClass(READONLY)) {
                    this.$el.addClass(READONLY);
                }
            } else {
                if (this.$el.hasClass(READONLY)) {
                    this.$el.removeClass(READONLY);
                }
            }
        },

        doInputReminder: function() {
            // 只取第一个input提示
            var reminders = this.model.get('reminders');
            var reminder = _.find(reminders, function(reminder, index, list) {
                return (reminder.mode === 'input');
            });

            if (reminder) {
                this.inputTip = reminder.text;
            }
        }
    });

    //
    module.exports = AsInput;
});
