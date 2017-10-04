define(function(require, exports, module) {
    //
    var Expression = require('src/schema/control/expression');

    //
    module.exports = Backbone.View.extend({
        tagName: 'div',
        className: 'content asinput clearfix',

        events: {
            'focus input': function() {
                var $input = this.$('input');
                if (this.inputTip && $input.val() === this.inputTip) {
                    this.$el.removeClass(this.TIP);
                    this.$el.val('');
                }
            },

            'blur input': function() {
                var $input = this.$('input');
                var value = as.util.trimedValue($input);
                if (this.last !== value) {
                    this.model.setValue(value);
                    this.last = value;
                }

                if (this.inputTip && !value) {
                    $input.addClass(this.TIP);
                    $input.val(this.inputTip);
                }
            },
        },

        initialize: function() {
            // data
            this.offCbs = [];

            // connect
            this.model.on('valueUpdated', this.render, this); // 由内而外更新值
            this.model.on('readonlyStatusChanged', this.render, this);
            this.model.on('disableStatusChanged', this.render, this);
            this.model.on('autoValueStatusChanged', this.handleAutoValue, this);
            this.model.on('actionEstimateAmountChanged', this.handleEstimateAmount, this);

            // 输入框内提示 
            this.doInputReminder();
            this.doWidth();
        },

        render: function() {
            // 清空
            this.$el.empty();

            this.last = this.model.value();
            var $input = $('<input>').attr('placeholder', this.placeholder).val(this.last);
            $input.bind('textchange', this.model, this.model.dispatch); // 向上传递 
            $input.prop('disabled', this.model.isReadonly());
            this.$el.append($input);

            var unit = this.model.get('unit');
            if (unit) {
                var $unit = $('<div class="unit">').text(unit);
                var unitWidth = as.util.measureText(unit).width + 4;
                $unit.css('left', 'calc(100% - ' + unitWidth + 'px)');
                $input.css('padding-right', unitWidth + 'px').css('width', 'calc(100% - ' + (unitWidth + 2) + 'px)');
                this.$el.append($unit);
            }
        },

        doInputReminder: function() {
            // 只取第一个input提示
            var text = '';
            _.find(this.model.get('reminders'), function(reminder) {
                if (reminder.mode === 'input') {
                    text = reminder.text;
                    return true;
                }
            });

            this.placeholder = text;
        },

        doWidth: function() {
            var css = this.model.get('css');
            if (_.isObject(css) && css.width) {
                this.$el.css('width', css.width);
            }
        },

        handleAutoValue: function() {
            var action = 'autoValue';
            var autoValue = this.model.getActionStatus(action);
            if (!_.isString(autoValue)) {
                return;
            }

            // 不管有或者没有，先移除掉先前的连接
            this.clearOffCb();
            this.exp = undefined;

            //bind 监听依赖项
            if (autoValue.length > 0) {
                var exp = new Expression(autoValue);
                var depends = exp.depends();
                var me = this;
                _.each(depends, function(depend) {
                    depend = depend.substr(1);
                    var field = as.schema.find(depend);
                    if (field) {
                        field.on('valueChanged', me.autoSetValue, me);
                        me.pushOffCb(function() {
                            field.off('valueChanged', me.autoSetValue, me);
                            log('off valueChanged >>', field.id);
                        });
                    }
                });

                this.exp = exp;
                this.autoSetValue(); // 响应该action时，第一次手动赋值
            }
        },

        autoSetValue: function() {
            if (this.exp) {
                var autoValue = this.exp.caculate();
                this.$(':text').val(autoValue);
                this.model.setValue(autoValue, true); //暂不校验
                log('autoSetValue >>', this.model.id, ' => ', autoValue);
            }
        },

        pushOffCb: function(cb) {
            this.offCbs.push(cb);
        },

        clearOffCb: function() {
            for (var i = 0; i < this.offCbs.length; ++i) {
                var cb = this.offCbs[i];
                if (_.isFunction(cb)) {
                    cb();
                }
            }

            this.offCbs = [];
        },

        handleEstimateAmount: function(name, value) {
            this.$('.estimate-amount').remove();
            if (value) {
                if (as.util.isExp(value)) {
                    var exp = new Expression(value);
                    value = exp.caculate();
                }

                var $text = $('<span class="estimate-amount">').text(value);
                this.$el.append($text);
            }
        }
    });
});
