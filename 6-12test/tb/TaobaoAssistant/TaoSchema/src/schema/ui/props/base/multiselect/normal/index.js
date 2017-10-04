/**
 * 
 */

define(function(require, exports, module) {
    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'prop-multiselect',

        events: {
            "click :checkbox": function() {
                // 写值
                this.updateValues();

                // 更新自定义选项状态
                var $src = $(event.srcElement);
                if ($src.attr('custom') === 'true') {
                    this.updateCustomOptionStatus($src, true);
                }
            },

            'focus :text': function() {
                var $input = $(event.srcElement);
                var $checkbox = $input.siblings(':checkbox');
                if (!$checkbox.prop('checked')) {
                    $checkbox.prop('checked', true);
                    this.updateCustomOptionStatus($input.siblings(':checkbox'), false);
                }
            },

            'blur :text': function() {
                var $input = $(event.srcElement);
                var text = $input.val();
                if (text) {
                    if (this.isTextRepeat($input[0])) {
                        $input.val('');
                        as.util.showErrorTip('自定义项不能重复！');
                    } else {
                        this.updateValues();
                    }
                }
            },

            "click .show-all": function() {
                this.showAll = true;
                this.render();
            },

            "click .show-part": function() {
                this.showAll = false;
                this.render();
            }
        },

        initialize: function() {
            // config
            this.showAll = true;
            this.COUNT = 2;

            // 是否支持自定义
            this.custom = this.model.get('custom');

            // readonly
            this.model.on('readonlyStatusChanged', this.render, this);
            this.model.on('valueUpdated', this.render, this);
        },

        render: function() {
            //
            this.$el.empty();

            // 只读灰质背景
            this.readonly = this.model.isReadonly();
            if (this.readonly) {
                this.$el.css('background-color', '#f6f6f6');
            }

            // 处理标准选项
            var me = this;
            var options = this.model.get('options');
            var value = this.model.value();
            _.each(options, function(option, index) {
                me.$el.append(me.renderOption(option, as.util.isOptionChecked(option, value)));
            });

            // 处理自定义选项
            if (this.custom) {
                var customOptions = as.util.pickCustomOptions(value);
                var normalSize = this.model.get('options').length;
                _.each(customOptions, function(option, index) {
                    me.$el.append(me.renderCustomOption(option, true));
                });

                // 追加空项
                this.$el.append(this.renderCustomOption({ 'value': '-1', 'text': '' }, false));
            }
        },

        renderOption: function(option, isChecked) {
            var $option = $('<div class="option clearfix">');
            var $checkbox = $('<input type="checkbox">').prop('disabled', this.readonly).data('value', option.value).addClass('checkbox');
            $checkbox.prop('checked', isChecked);
            var $text = $('<span class="text">').text(option.text);
            $option.append($checkbox).append($text);

            return $option;
        },

        renderCustomOption: function(option, isChecked) {
            var $option = $('<div class="option clearfix">');
            var $checkbox = $('<input type="checkbox" custom="true">').prop('disabled', this.readonly).data('value', option.value).addClass('checkbox');
            $checkbox.prop('checked', isChecked);
            var $text = $('<input class="text" placeholder="自定义">').val(option.text);
            $option.append($checkbox).append($text);

            return $option;
        },

        canAddMore: function() {
            if (!_.isObject(this.custom)) {
                return true;
            }
            if (!_.isNumber(this.custom.maxItems)) {
                return true;
            }

            return (this.customOptionCount() < this.custom.maxItems);
        },

        customOptionCount: function() {
            var count = 0;
            this.$(':checkbox').each(function(i, e) {
                if ($(e).attr('custom') === 'true') {
                    count += 1;
                }
            });

            return count;
        },

        isAllCustomOptionSelected: function() {
            var isAllSelected = true;
            this.$(':checkbox').each(function(i, e) {
                if ($(e).attr('custom') === 'true' && !$(e).prop('checked')) {
                    isAllSelected = false;
                    return false;
                }
            });

            return isAllSelected;
        },

        updateValues: function() {
            var values = [];
            this.$(':checkbox').each(function() {
                var $checkbox = $(this);
                if ($checkbox.prop('checked')) {
                    var value = $checkbox.data('value');
                    if (Number(value) < 0) { //自定义
                        var $input = $checkbox.siblings(':text');
                        if ($input.val()) {
                            values.push({
                                'value': value,
                                'text': $input.val()
                            });
                        }
                    } else { //标准枚举值
                        values.push({
                            'value': value,
                            'text': $checkbox.siblings('.text').text()
                        });
                    }
                }
            });

            this.model.setValue(values);
        },

        updateCustomOptionStatus: function($src, isGetFocus) {
            if ($src.prop('checked')) {
                if (this.canAddMore()) {
                    this.$el.append(this.renderCustomOption({ value: '-1', text: '' }, false));
                }
                if (isGetFocus) {
                    $src.siblings(':text').focus();
                }
            } else {
                $src.parent().remove();
                if (this.customOptionCount() === 0 || this.isAllCustomOptionSelected()) {
                    this.$el.append(this.renderCustomOption({ value: '-1', text: '' }, false));
                }
            }
        },

        isTextRepeat: function(input) {
            var text = $(input).val();
            var isTextRepeat = false;

            this.$(':text').each(function(i, e) {
                if (input !== e && $(e).val() === text) {
                    isTextRepeat = true;
                    return false;
                }
            });

            return isTextRepeat;
        }
    });

    //
    module.exports = View;
});
