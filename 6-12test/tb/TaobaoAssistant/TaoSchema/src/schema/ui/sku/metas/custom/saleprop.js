/*
model: field
*/
define(function(require, exports, module) {
    var BaseView = require('src/schema/baseview');
    var MIN = 0; // 生成负数id需要，维持当前最小值，递减

    var autoAddOption = function(context, $checkbox) {
        context.insertOption($checkbox.parent());
        if (context.canAddMoreOption()) {
            context.$('.options-panel').append(context.renderEmptyOption());
        }
    };

    var isCustomSalePropChanged = function(current, last) {
        var hasValidOption = function(list) {
            var has = false;
            if (_.isArray(list) && list.length > 0) {
                _.find(list, function(option) {
                    if (option.value && option.text) {
                        has = true;
                        return true;
                    }
                });
            }

            return has;
        };
        // 从无值到有值
        var isFromEmpty2Valid = function(last, current) {
            return !hasValidOption(last) && hasValidOption(current);

        };

        // 从有值到无值
        var isFromValid2Empty = function(last, current) {
            return hasValidOption(last) && !hasValidOption(current);
        };

        return isFromEmpty2Valid(last, current) || isFromValid2Empty(last, current);
    };

    module.exports = BaseView.extend({
        tagName: 'div',
        className: 'schema custom-sale-prop',

        events: {
            'click .delete-btn': function() {
                this.manager.remove(this.model);
                this.$el.remove();
            },

            'blur .title-input': function() {
                var $title = $(event.srcElement);
                var value = this.checkTitle(as.util.trimedValue($title));
                if (value && this.isTitleRepeat(value)) {
                    as.util.showErrorTip('规格名称重复，请重新输入！');
                    $title.val('');
                    this.updateTitle('');
                    return;
                }

                var last = $title.data('last');
                if (last !== value) {
                    $title.data('last', value);
                    this.updateTitle(value);
                }
            },

            'click .option :checkbox': function() {
                var $checkbox = $(event.srcElement);
                if ($checkbox.prop('checked')) {
                    autoAddOption(this, $checkbox);
                } else {
                    this.removeOption($checkbox.parent());
                    $checkbox.parent().remove();
                    if (!this.hasEmptyOption()) {
                        this.$('.options-panel').append(this.renderEmptyOption());
                    }
                }
            },

            'focus .option :text': function() {
                var $input = $(event.srcElement);
                var $checkbox = $input.siblings(':checkbox');
                if (!$checkbox.prop('checked')) {
                    $checkbox.prop('checked', true);
                    autoAddOption(this, $checkbox);
                }
            },

            'blur .option :text': function() {
                var $input = $(event.srcElement);
                var value = this.checkOptionText(as.util.trimedValue($input));
                if (value && this.isOptionTextRepeat(value, $input[0])) {
                    as.util.showErrorTip('规格选项重复，请重新填写！');
                    $input.val('');
                    this.updateValue();
                    return;
                }

                var last = $input.data('last');
                if (last !== value) {
                    $input.data('last', value);
                    this.updateOption($input.parent());
                }
            }
        },

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
        },

        render: function() {
            this.$el.empty();

            var $title = $('<input class="title-input">')
                .attr('placeholder', '规格名称')
                .data('last', this.model.get('title'))
                .val(this.model.get('title'));
            this.$el.append($title);

            var $delete = $('<span class="delete-btn">').text('删除');
            this.$el.append($delete);

            var $options = this.renderOptions();
            this.$el.append($options);
        },

        renderOptions: function() {
            var $options = $('<div class="options-panel">');
            var value = this.model.value();
            if (_.isArray(value)) {
                var me = this;
                _.each(value, function(option) {
                    if (_.isObject(option) && option.value && option.text) {
                        MIN = Number(option.value) < MIN ? Number(option.value) : MIN;
                        $options.append(me.renderOneOption(option));
                    }
                });
            }

            if (this.canAddMoreOption()) {
                $options.append(this.renderEmptyOption());
            }
            return $options;
        },

        renderOneOption: function(option) {
            var $option = $('<div class="option">');
            var $checkbox = $('<input type="checkbox">').data('value', option.value).prop('checked', !!option.text);
            var $input = $('<input type="text">').attr('placeholder', '规格内容').data('data', option.text).val(option.text);
            return $option.append($checkbox).append($input);
        },

        renderEmptyOption: function() {
            var option = { text: '', value: (MIN -= 1) };
            return this.renderOneOption(option);
        },

        canAddMoreOption: function() {
            var valueMaxItems = Number(this.model.get('valueMaxItems'));
            if (valueMaxItems > 0) {
                return (this.$('.option').size() < valueMaxItems);
            } else {
                return true;
            }
        },

        checkTitle: function(text) {
            var titleMaxLength = Number(this.model.get('titleMaxLength'));
            if (titleMaxLength > 0) {
                var size = as.util.bytes(text);
                if (size > titleMaxLength) {
                    as.util.showErrorTip('规格标题最多' + titleMaxLength + '个字符(' + titleMaxLength / 2 + '个汉字),已自动截断');
                    text = as.util.subBytes(text, titleMaxLength);
                }
            }

            return text;
        },

        checkOptionText: function(text) {
            var valueMaxLength = Number(this.model.get('valueMaxLength'));
            if (valueMaxLength > 0) {
                var size = as.util.bytes(text);
                if (size > valueMaxLength) {
                    as.util.showErrorTip('规格选项最多' + valueMaxLength + '个字符(' + valueMaxLength / 2 + '个汉字),已自动截断');
                    text = as.util.subBytes(text, valueMaxLength);
                }
            }

            return text;
        },

        isOptionTextRepeat: function(text, input) {
            var isRepeat = false;
            this.$('.option :text').each(function(i, e) {
                if (e !== input && $(e).val() === text) {
                    isRepeat = true;
                    return false;
                }
            });

            return isRepeat;
        },

        isTitleRepeat: function(title) {
            return this.manager.isTitleRepeat(title, this.model);
        },

        hasEmptyOption: function() {
            var has = false;
            this.$('.option :checkbox').each(function(i, e) {
                if (!$(e).prop('checked')) {
                    has = true;
                    return false;
                }
            });

            return has;
        },

        insertOption: function($option) {
            var option = {
                text: $(':text', $option).val(),
                value: $(':checkbox', $option).data('value')
            };

            var options = this.model.get('options');
            options.splice($option.index(), 0, option);
            if (option.value && option.text) {
                this.updateValue();
            }
        },

        updateOption: function($option) {
            this.updateValue();
        },

        removeOption: function($option) {
            // 删除当前找到的项
            var value = $(':checkbox', $option).data('value');
            _.find(this.model.get('options'), function(option, index, options) {
                if (option.value === value) {
                    options.splice(index, 1);
                    return true;
                }
            });

            if ($(':text', $option).val()) {
                this.updateValue();
            }
        },

        updateTitle: function(title) {
            var last = this.model.get('title');
            if (last !== title) {
                this.model.set('title', title);
                this.manager.updateValidProps();
            }
        },

        updateValue: function() {
            var value = [];
            this.$('.option').each(function(i, e) {
                var $option = $(e);
                var $checkbox = $(':checkbox', $option);
                var $input = $(':text', $option);
                if ($checkbox.prop('checked') && $input.val()) {
                    value.push({
                        value: $checkbox.data('value'),
                        text: $input.val()
                    });
                }
            });

            // 更新值
            var lastValue = this.model.value();
            if (isCustomSalePropChanged(value, lastValue)) {
                this.model.setValue(value, true);
                this.manager.updateValidProps();
            } else {
                this.model.setValue(value, false);
                this.manager.onUpdate();
            }
        }
    });
});
