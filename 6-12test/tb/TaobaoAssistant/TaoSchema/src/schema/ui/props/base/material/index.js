/**
 * 
 */

define(function(require, exports, module) {
    //
    var MaterialDialog = require('src/schema/ui/props/base/material/dialog');

    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'com-material',

        "events": {
            'click .empty-value': function() {
                this.doSelect();
            },

            'click .edit-button': function() {
                this.doSelect();
            }
        },

        initialize: function() {

        },

        render: function() {
            // 重置
            this.$el.empty();

            var value = this.model.value();
            if (_.isArray(value) && value.length > 0) {
                this.renderValues();
            } else {
                this.renderEmpty();
            }
        },

        renderEmpty: function() {
            var html = '\
			<div class="value-panel empty-value">\
				<div class="tip-text">请选择</div>\
				<div class="tip-icon"></div>\
			</div>';

            this.$el.append($(html));
        },

        renderValues: function() {
            var $panel = $('<div class="value-panel">');
            $panel.append($('<div class="selected-text edit-button">').text('修改'));

            var values = this.model.value();
            _.each(values, function(option) {
                var html = option.text;
                if (option.content) {
                    html += ('&nbsp;&nbsp;' + escape(option.content) + '%');
                }
                $panel.append($('<div class="selected-text">').html(html));
            });

            this.$el.append($panel);
        },

        doSelect: function() {
            var me = this;
            var dialog = new MaterialDialog({
                model: {
                    title: this.model.get('title'),
                    buttons: [{
                        text: '确定',
                        click: function() {
                            dialog.close();
                        }
                    }],

                    beforeCloseCb: function() {
                        var selectedOptions = dialog.selectedOptions();
                        var errors = me.check(selectedOptions);
                        dialog.updateErrors(errors);

                        if (errors.length === 0) {
                            me.updateValues(selectedOptions);
                            return true;
                        } else {
                            return false;
                        }
                    },

                    maxItems: this.model.get('maxItems'),
                    options: this.model.get('options'),
                    value: this.model.value()
                }
            });

            dialog.render();
        },

        updateValues: function(options) {
            this.model.setValue(options);
            this.render();
        },

        check: function(options) {
            // 检查已选项是否超过限制
            // 检查可输入项是否都已经输入
            // 检查可输入项之和是否为100
            // 检查小数点位数
            var errors = [];
            if (this.isExceedMaxItems(options)) {
                errors.push('最多勾选' + this.model.get('maxItems') + '个材质，当前已勾选' + options.length + '个');
            }
            if (this.isInputNoContent(options)) {
                errors.push('含量不能为空，且必须是大于0的数字');
            }
            if (this.isSumNotEqual100(options)) {
                errors.push('含量之和必须为100%');
            }
            if (this.isExceedDecimalDigits(options)) {
                var rule = this.model.findRule('decimalDigits');
                errors.push('含量值最多使用' + rule.value + '位小数');
            }

            return errors;
        },

        isExceedMaxItems: function(options) {
            var maxItems = this.model.get('maxItems');
            return options.length > maxItems;
        },

        isExceedDecimalDigits: function(options) {
            var isExceed = false;
            var rule = this.model.findRule('decimalDigits');
            var decimalDigits = rule ? rule.value : undefined;
            if (decimalDigits >= 0) {
                _.find(options, function(option) {
                    if (decimalDigits < as.util.digits(option.content)) {
                        isExceed = true;
                        return true;
                    }
                });
            }

            return isExceed;
        },

        isInputNoContent: function(options) {
            var isNoContent = false;
            for (var i = 0; i < options.length; ++i) {
                var option = options[i];
                if (this.isOptionNeedContent(option.value) && !(Number(option.content) > 0)) {
                    isNoContent = true;
                    break;
                }
            }

            return isNoContent;
        },

        isSumNotEqual100: function(options) {
            var sum = 0;
            var hasInput = false;
            for (var i = 0; i < options.length; ++i) {
                if (this.isOptionNeedContent(options[i].value)) {
                    // 如果有输入项，则不允许和为0
                    hasInput = true;
                }

                var content = options[i].content;
                if (!isNaN(Number(content))) {
                    sum += Number(content);
                }
            }

            if (hasInput) {
                return sum !== 100;
            } else {
                return sum !== 0;
            }
        },

        isOptionNeedContent: function(value) {
            var option = _.find(this.model.get('options'), function(option) {
                return (option.value === value);
            });

            return (_.isObject(option) && option.needContentNumber);
        }
    });

    //
    module.exports = View;
});
