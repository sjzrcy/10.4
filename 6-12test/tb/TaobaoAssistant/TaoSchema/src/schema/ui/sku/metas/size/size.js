define(function(require, exports, module) {
    //
    var SizeGroup = require('src/schema/ui/sku/metas/size/group');

    // 1 尺码分组
    // 2 尺码备注
    // 3 尺码自定义
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'sku-size',

        events: {
            'click .size-option-panel :checkbox': function() {
                var $checkbox = $(event.srcElement);
                var $input = $checkbox.siblings(':text');
                if ($checkbox.prop('checked')) {
                    $input.css('opacity', '1.0');
                } else {
                    $input.css('opacity', '0.0');
                }

                // 更新当前值
                this.updateValue();
            },

            'blur .size-option-panel :text': function() {
                var $remark = $(event.srcElement);
                var last = $remark.data('last');
                var remark = as.util.trimedValue($remark);

                // 最大长度规则
                if (this.remarkMaxLength && as.util.bytes(remark) > this.remarkMaxLength) {
                    remark = as.util.subBytes(remark, this.remarkMaxLength);
                    as.util.showErrorTip('尺码备注最大长度为' + this.remarkMaxLength + '(' + this.remarkMaxLength / 2 + '个汉字)，已自动截断为：' + remark);
                    $remark.val(remark);
                }

                if (last !== remark) {
                    $remark.data('last', remark);

                    // 更新备注
                    var value = $remark.siblings(':checkbox').data('value');
                    this.updateRemark(value, remark);
                }
            },

            'click .custom-size-option-panel :checkbox': function() {
                var $checkbox = $(event.srcElement);
                if ($checkbox.prop('checked')) {
                    this.$('.custom-size-option-panel').append(this.emptyOption());
                    $checkbox.siblings(':text').focus();
                } else {
                    $checkbox.parent().remove();
                    this.updateValue();
                }
            },

            'focus .custom-size-option-panel :text': function() {
                var $input = $(event.srcElement);
                var $checkbox = $input.siblings(':checkbox');
                if (!$checkbox.prop('checked')) {
                    $checkbox.prop('checked', true);
                    this.$('.custom-size-option-panel').append(this.emptyOption());
                }
            },

            'blur .custom-size-option-panel :text': function() {
                var $input = $(event.srcElement);
                var last = $input.data('last');
                var text = as.util.trimedValue($input);
                if (last !== text) {
                    if (this.isRepeatInStandardOption(text) && text) {
                        $input.val(last);
                        as.util.showErrorTip('不允许自定义尺码和标准值重复！');
                    } else if (this.isRepeatInCustomOption(text, event.srcElement) && text) {
                        $input.val(last);
                        as.util.showErrorTip('不允许重复的自定义尺码！');
                    } else {
                        $input.data('last', text);
                        this.updateValue();
                    }
                }
            }
        },

        initialize: function() {
            this.MIN = -1;
            this.initGroup();
            this.initRemark();
            this.initCustom();
            this.updateOptions();
        },

        initGroup: function() {
            var id = this.model.get('group-ref');
            if (id) {
                var group = as.schema.find(id);
                if (group) {
                    if (!group.value()) { // 默认赋值第一项
                        group.setValue(group.get('options')[0].value, true);
                    }

                    group.on('valueChanged', this.onGroupValueChanged, this);
                    this.group = group;
                }
            }
        },

        initRemark: function() {
            this.remark = this.model.get('remark');
            if (_.isObject(this.remark) && this.remark.maxLength) {
                this.remarkMaxLength = this.remark.maxLength;
            }
        },

        initCustom: function() {
            this.custom = this.model.get('custom');
        },

        updateOptions: function() {
            if (!this.group) {
                return;
            }

            var options = [];
            var groupValue = this.group.value();
            if (!groupValue || !as.util.isInOptions(groupValue, this.group.get('options'))) {
                groupValue = this.group.get('options')[0].value;
                this.group.setValue(groupValue, true);
            }

            var groupConfig = this.model.get('group');
            var config = _.find(groupConfig, function(config) {
                if (config.value === groupValue) {
                    options = config.options;
                    return true;
                }
            });

            // 更新options
            this.model.set('options', options);
        },

        // 分组信息变化
        onGroupValueChanged: function() {
            this.model.setValue(undefined);
            this.updateOptions();
            this.render();
        },

        render: function() {
            this.$el.empty();
            this.renderGroup();
            this.renderOptions();
            this.renderCustomOptions();

            // 标准选项随时会变，这里更新动作，是为了筛选掉失效的项
            this.updateValue();
        },

        renderGroup: function() {
            if (!this.group) {
                return;
            }

            var view = new SizeGroup({ model: this.group });
            view.render();
            this.$el.append(view.$el);
        },

        renderOptions: function() {
            var $panel = $('<div class="size-option-panel clearfix">');
            this.$el.append($panel);

            var remark = this.remark;
            var options = this.model.get('options');
            var values = this.model.value();

            // 获取备注信息
            var getRemark = function(value, valueList) {
                var remark = '';
                if (_.isArray(valueList)) {
                    var option = _.find(valueList, function(option) {
                        return (option.value === value);
                    });
                    if (typeof option === 'object' && option.remark) {
                        remark = option.remark;
                    }
                }

                return remark;
            };

            _.each(options, function(option) {
                var isChecked = as.util.isOptionChecked(option, values);
                var $check = $('<input type="checkbox">').data('value', option.value).prop('checked', isChecked);
                var $text = $('<span class="size-text">').text(option.text);
                var $option = $('<div class="size-option">');
                $option.append($check).append($text);

                if (remark) {
                    var $input = $('<input type="text" placeholder="备注">').val(getRemark(option.value, values));
                    $option.append($input);
                    if (isChecked) {
                        $input.css('opacity', '1.0');
                    } else {
                        $input.css('opacity', '0.0');
                    }
                }

                $panel.append($option);
            });
        },

        getSelectedOptions: function() {
            var options = [];
            this.$('.size-option-panel :checked').each(function(i, e) {
                var $checkbox = $(e);
                options.push({
                    value: $checkbox.data('value'),
                    text: $checkbox.siblings('.size-text').text(),
                    remark: $checkbox.siblings(':text').val()
                });
            });

            return options;
        },

        renderCustomOptions: function() {
            if (!this.custom) {
                return;
            }

            var $panel = $('<div class="custom-size-option-panel clearfix"><div>自定义尺码</div></div>');
            this.$el.append($panel);

            var custom = this.custom;
            var values = this.model.value();
            _.each(values, function(option) {
                var customValue = Number(option.value);
                if (customValue >= 0) {
                    return;
                }

                // 维持一个当前最小负数
                if (customValue < this.MIN) {
                    this.MIN = customValue;
                }

                var $check = $('<input type="checkbox" custom="true">').data('value', option.value).prop('checked', true);
                var $input = $('<input type="text" placeholder="自定义尺码" custom="true">').val(option.text);
                var $option = $('<div class="size-custom-option">').append($check).append($input);
                $panel.append($option);
            });

            $panel.append(this.emptyOption());
        },

        emptyOption: function() {
            // 使用前减1
            this.MIN -= 1;
            var $empty = $('<div class="size-custom-option"><input type="checkbox" custom="true"/><input type="text" placeholder="自定义尺码"/></div>');
            $(':checkbox', $empty).data('value', String(this.MIN));
            return $empty;
        },

        getCustomSelectedOptions: function() {
            var options = [];
            this.$('.custom-size-option-panel :checked').each(function(i, e) {
                var $checkbox = $(e);
                var text = $checkbox.siblings(':text').val();
                if (text) {
                    options.push({
                        value: $checkbox.data('value'),
                        text: text
                    });
                }
            });

            return options;
        },

        selectedOptions: function() {
            return this.getSelectedOptions().concat(this.getCustomSelectedOptions());
        },

        updateValue: function() {
            this.model.setValue(this.selectedOptions());
        },

        updateRemark: function(value, remark) {
            var values = this.model.value();
            var option = _.find(values, function(option) {
                return (option.value === value);
            });

            if (option) {
                option.remark = remark;
            }
        },

        isTextRepeat: function(text, el) {
            return (this.isRepeatInStandardOption(text) || this.isRepeatInCustomOption(text, el));
        },

        isRepeatInStandardOption: function(text) {
            var isRepeat = false;
            this.$('.size-option-panel :checkbox').each(function(i, e) {
                if ($(e).siblings('.size-text').text() === text) {
                    isRepeat = true;
                    return false;
                }
            });

            return isRepeat;
        },

        isRepeatInCustomOption: function(text, input) {
            var isRepeat = false;
            this.$('.custom-size-option-panel :checkbox').each(function(i, e) {
                var $input = $(e).siblings(':text');
                if ($input[0] === input) {
                    return;
                }
                if ($input.val() === text) {
                    isRepeat = true;
                    return false;
                }
            });

            return isRepeat;
        }
    });

    module.exports = View;
});
