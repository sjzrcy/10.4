define(function(require, exports, module) {
    //
    module.exports = Backbone.View.extend({
        tagName: 'div',
        className: 'sku-measure',

        events: {
            'focus .measure-item :text': function() {
                var $input = $(event.srcElement);
                var $checkbox = $input.siblings(':checkbox');
                if (!$checkbox.prop('checked')) {
                    $checkbox.prop('checked', true);
                    this.renderEmptyMeasureItem();
                }
            },

            'blur .measure-item :text': function() {
                var $input = $(event.srcElement);
                var value = as.util.trimedValue($input);

                // 数字规则
                var dataType = $input.attr('dataType');
                if (dataType === 'integer' || dataType === 'number') {
                    var temp = Number(value);
                    if (isNaN(temp)) {
                        as.util.showErrorTip('输入值必须为数字！');
                        $input.val('');
                    }
                }

                // 小数点
                var digit = Number($input.attr('digit'));
                if (digit > 0) {
                    var count = as.util.digits(value);
                    if (count > digit) {
                        $input.val(value.substr(0, (value.indexOf('.') + digit + 1)));
                        as.util.showErrorTip('最多输入' + digit + '位小数，已自动修正！');
                    }
                }

                // 更新当前项的值
                this.updateValueItem($input.parent());
            },

            'change .measure-item select': function() {
                if (!this.isSameUnit) {
                    this.updateValueItem($(event.srcElement).parent());
                    return;
                }

                var $select = $(event.srcElement);
                this.$('.measure-item select').val($select.val());

                var me = this;
                this.$('.measure-item').each(function(i, e) {
                    me.updateValueItem($(e));
                });
            },

            'click .measure-item :checkbox': function() {
                var $checkbox = $(event.srcElement);
                if ($checkbox.prop('checked')) {
                    this.renderEmptyMeasureItem();
                } else {
                    var value = $checkbox.data('value');
                    this.removeValue(value);
                    $checkbox.parent().remove();
                }
            },

            'click .same-unit :checkbox': function() {
                this.isSameUnit = $(event.srcElement).prop('checked');
            }
        },

        initialize: function() {
            this.MIN = 0;
            this.isSameUnit = false;
            this.setOnlyOneInput();

            this.initHandlers();
            this.patchOperators();
            this.patchUnits();
        },

        setOnlyOneInput: function() {
            var count = 0;
            _.each(this.model.get('children'), function(schema) {
                if (schema.type === 'input') {
                    count += 1;
                }
            });

            // 标记只有一个输入框
            this.isOnlyOneInput = (count === 1);
        },

        initHandlers: function() {
            this.handlers = {
                input: this.renderInput.bind(this),
                operator: this.renderOperator.bind(this),
                unit: this.renderUnit.bind(this)
            };
        },

        patchOperators: function() {
            this.operators = [];

            var me = this;
            _.each(this.model.get('children'), function(schema) {
                if (schema.type === 'operator' && me.operators.indexOf(schema.text) === -1) {
                    me.operators.push(schema.text);
                }
            });
        },

        patchUnits: function() {
            this.units = [];
            var me = this;
            _.find(this.model.get('children'), function(schema) {
                if (schema.type === 'unit') {
                    me.units = schema.options;
                    return true;
                }
            });
        },

        patchUnit: function(value) {
            var unit = '';
            if (typeof(value) !== 'string' || !value) {
                return unit;
            }

            // 找出所有可能的单位
            var unitArray = [];
            _.each(this.units, function(oneUnit) {
                if (oneUnit && value.indexOf(oneUnit) !== -1) {
                    unitArray.push(oneUnit);
                }
            });

            // 提取最长的单位
            _.each(unitArray, function(oneUnit) {
                if (oneUnit.length > unit.length) {
                    unit = oneUnit;
                }
            });

            return unit;
        },

        patchInitValue: function(value) {
            var inits = [];
            var unit = this.patchUnit(value);
            if (typeof(value) !== 'string' || !value || !unit) {
                return inits;
            }

            var index = value.indexOf(unit);
            if (index === -1) {
                return inits;
            }

            value = value.substr(0, index);
            var from = 0;
            for (var i = 0; i < value.length; ++i) {
                if (this.operators.indexOf(value[i]) !== -1) {
                    inits.push(value.substring(from, i));
                    inits.push(value.substring(i, i + 1));
                    from = i + 1;
                } else if (i === value.length - 1) {
                    inits.push(value.substring(from));
                }
            }

            inits.push(unit);
            return inits;
        },

        render: function() {
            this.$el.empty();
            this.renderExpSample();
            this.renderMeasureItem();
            this.renderUnitCheckbox();
        },

        renderExpSample: function() {
            var expSample = this.model.get('expSample');
            if (expSample) {
                this.$el.append($('<p class="exp-sample">').text(expSample));
            }
        },

        renderUnitCheckbox: function() {
            var render = false;
            _.each(this.model.get('children'), function(schema) {
                if (schema.type === 'unit') {
                    render = (_.isArray(schema.options) && (schema.options.length > 1));
                    return true;
                }
            });
            if (!render) {
                return;
            }

            var $el = $('<div class="same-unit">');
            $el.append($('<span class="text">').text('统一单位'));
            $el.append($('<input type="checkbox">'));
            this.$el.append($el);
        },

        renderMeasureItem: function() {
            var me = this;
            var value = this.model.value();
            if (_.isArray(value) && value.length) {
                _.each(value, function(valueItem) {
                    // 维持一个最小负数
                    if (me.MIN > valueItem.value) {
                        me.MIN = valueItem.value;
                    }
                    me.renderOneMeasureItem(valueItem);
                });
            }

            // 追加一个空项
            this.renderEmptyMeasureItem();
        },

        renderEmptyMeasureItem: function() {
            // 每次创建新的空项时，负数递减1
            this.renderOneMeasureItem({ value: Number(this.MIN -= 1).toString(), text: '' });
        },

        renderOneMeasureItem: function(valueItem) {
            var $el = $('<div class="measure-item">');
            $el.append($('<input type="checkbox">').prop('checked', !!valueItem.text).data('value', valueItem.value));
            this.renderChildren($el, valueItem.text);
            this.$el.append($el);
        },

        renderChildren: function($item, text) {
            var me = this;
            var inits = this.patchInitValue(text);
            _.each(this.model.get('children'), function(schema, index) {
                me.renderChild($item, schema, inits[index]);
            });
        },

        renderChild: function($item, schema, value) {
            var handle = this.handlers[schema.type];
            if (typeof(handle) === 'function') {
                handle($item, schema, value);
            }
        },

        renderInput: function($item, schema, value) {
            var $input = $('<input tag="submit" rule="input" type="text">').attr('placeholder', schema.placeholder).val(value);
            if (this.isOnlyOneInput) {
                $input.css('width', '138px').css('text-align', 'left');
            }

            if (schema.maxLength) { // 长度限制
                $input.attr('maxLength', schema.maxLength);
            }
            if (schema.decimalDigits) { // 小数点限制
                $input.attr('digit', schema.decimalDigits);
            }
            if (schema.dataType) { // 数据类型限制
                $input.attr('dataType', schema.dataType);
            }

            $item.append($input);
        },

        renderOperator: function($item, schema, value) {
            var $text = $('<span tag="submit" rule="operator" class="operator">').text(schema.text);
            $item.append($text);
        },

        renderUnit: function($item, schema, value) {
            // 只有一个单位，则直接固化
            if (schema.options.length === 1) {
                var $text = $('<span tag="submit" rule="unit" class="unit">').text(schema.options[0]);
                $item.append($text);
                return;
            }

            // 可选
            var $select = $('<select tag="submit" rule="unit">');
            $select.append($('<option value="">').text('单位'));

            var me = this;
            _.each(schema.options, function(unit) {
                var $option = $('<option>').attr('value', unit).text(unit);
                $select.append($option);
            });


            if (this.isSameUnit) { // 如果是统一单位，则默认取第一项的单位
                var $firstSelect = $(this.$('.measure-item select')[0]);
                if ($firstSelect.length > 0) {
                    value = $firstSelect.val();
                }
            }
            $item.append($select.val(value));
        },

        findValue: function(vid) {
            var value = this.model.value();
            if (!_.isArray(value)) {
                return;
            }

            return (_.find(value, function(item, index) {
                if (item.value == vid) {
                    return true;
                }
            }));
        },

        updateValueItem: function($item) {
            var vid = $(':checkbox', $item).data('value');
            var lastValue = this.findValue(vid);
            var value;
            if (this.isComplete($item)) {
                value = this.patchValue($item);
                if (this.isValueExist(value, vid)) {
                    this.removeValue(vid);
                    $(':text', $item).val('');
                    as.util.showErrorTip(value + '重复，请重新填写！');
                    return;
                }

                if (lastValue) {
                    if (value !== lastValue.text) {
                        lastValue.text = value;
                        this.model.setValue(this.model.value());
                    }
                } else {
                    // insert
                    this.insertValue($item, { 'value': vid, 'text': value });
                }
            } else {
                if (lastValue) {
                    if (lastValue.text) {
                        lastValue.text = undefined;
                        this.removeValue(vid);
                    }
                }
            }
        },

        isComplete: function($item) {
            var isComplete = true;
            $(':text', $item).each(function(i, e) {
                if (!$(e).val()) {
                    isComplete = false;
                    return false;
                }
            });

            if (isComplete && $('select', $item).length) {
                isComplete = !!$('select', $item).val();
            }

            // 已经完整的项打标
            $item.attr('complete', isComplete ? 'true' : 'false');
            return isComplete;
        },

        patchValue: function($item) {
            var value = '';
            $('[tag="submit"]', $item).each(function(i, e) {
                var $el = $(e);
                var rule = $el.attr('rule');
                if (rule === 'input') {
                    value += $el.val();
                } else if (rule === 'operator') {
                    value += $el.text();
                } else if (rule === 'unit') {
                    if ($el.is('select')) {
                        value += $el.val();
                    } else {
                        value += $el.text()
                    }
                }
            });

            return value;
        },

        removeValue: function(vid) {
            var value = this.model.value();
            if (!_.isArray(value)) {
                return;
            }

            var findIndex;
            _.find(value, function(item, index) {
                if (item.value == vid) {
                    findIndex = index;
                    return true;
                }
            });
            if (findIndex !== undefined) {
                value.splice(findIndex, 1);
                this.model.setValue(value);
            }
        },

        isValueExist: function(text, vid) {
            var isExist = false;
            var value = this.model.value();
            if (!_.isArray(value)) {
                return isExist;
            }

            _.find(value, function(item, index) {
                if (item.text == text && item.value !== vid) {
                    isExist = true;
                    return true;
                }
            });
            return isExist;
        },

        insertValue: function($item, item) {
            var value = this.model.value();
            if (!_.isArray(value)) {
                this.model.setValue([item]);
                return;
            }

            // 找出当前项前面有多少合法项
            var count = 0;
            this.$('.measure-item').each(function(i, e) {
                if (e === $item[0]) {
                    return false;
                }

                var $temp = $(e);
                if ($temp.attr('complete') === 'true') {
                    count += 1;
                }
            });

            // 插入
            value.splice(count, 0, item);
            this.model.setValue(value);
        }
    });
});
