define(function(require, exports, module) {
    //
    module.exports = Backbone.View.extend({
        tagName: 'div',
        className: 'prop-measure',

        events: {
            'blur :text': function() {
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

                this.updateValue();
            },

            'change select': function() {
                this.updateValue();
            }
        },

        initialize: function() {
            this.model.on('valueUpdated', this.render, this);
            this.model.on('readonlyStatusChanged', this.render, this);

            this.initHandlers();
            this.patchOperators();
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

        patchUnit: function() {
            var value = this.model.value();
            if (typeof(value) !== 'string' || !value) {
                return;
            }

            var units = [];
            _.find(this.model.get('children'), function(schema) {
                if (schema.type === 'unit') {
                    units = schema.options;
                    return true;
                }
            });

            // 找出所有可能的单位
            var unitArray = [];
            _.each(units, function(unit) {
                if (unit && value.indexOf(unit) !== -1) {
                    unitArray.push(unit);
                }
            });

            // 提取最长的单位
            var maxLengthUnit = '';
            _.each(unitArray, function(oneUnit) {
                if (oneUnit.length > maxLengthUnit.length) {
                    maxLengthUnit = oneUnit;
                }
            });

            this.unit = maxLengthUnit;
        },

        initValue: function() {
            this.inits = [];

            var value = this.model.value();
            if (typeof(value) !== 'string' || !value || !this.unit) {
                return;
            }

            var index = value.indexOf(this.unit);
            if (index === -1) {
                return;
            }

            value = value.substr(0, index);
            var from = 0;
            for (var i = 0; i < value.length; ++i) {
                if (this.operators.indexOf(value[i]) !== -1) {
                    this.inits.push(value.substring(from, i));
                    this.inits.push(value.substring(i, i + 1));
                    from = i + 1;
                } else if (i === value.length - 1) {
                    this.inits.push(value.substring(from));
                }
            }
        },

        render: function() {
            this.$el.empty();

            // 提取单位，分割值
            this.patchUnit();
            this.initValue();

            this.renderExpSample();
            this.renderChildren();
        },

        renderExpSample: function() {
            var expSample = this.model.get('expSample');
            if (expSample) {
                this.$el.append($('<p class="exp-sample">').text(expSample));
            }
        },

        renderChildren: function() {
            var me = this;
            _.each(this.model.get('children'), function(schema, index) {
                me.renderChild(schema, me.inits[index]);
            });
        },

        renderChild: function(schema, value) {
            var handle = this.handlers[schema.type];
            if (typeof(handle) === 'function') {
                handle(schema, value);
            }
        },

        renderInput: function(schema, value) {
            var $input = $('<input tag="submit" rule="input">').attr('placeholder', schema.placeholder).val(value);
            if (this.model.isReadonly()) {
                $input.prop('disabled', true);
            }

            if (schema.maxLength) { // 长度限制
                $input.attr('maxLength', schema.maxLength);
            }
            if (schema.decimalDigits) {
                $input.attr('digit', schema.decimalDigits);
            }
            if (schema.dataType) { // 数据类型限制
                $input.attr('dataType', schema.dataType);
            }
            this.$el.append($input);
        },

        renderOperator: function(schema, value) {
            var $text = $('<span tag="submit" rule="operator" class="operator">').text(schema.text);
            this.$el.append($text);
        },

        renderUnit: function(schema, value) {
            // 只有一个单位，则直接固化
            if (schema.options.length === 1) {
                var $text = $('<span tag="submit" rule="unit" class="unit">').text(schema.options[0]);
                this.$el.append($text);
                return;
            }

            // 可选
            var $select = $('<select tag="submit" rule="unit">');
            $select.append($('<option value="">').text('单位'));
            if (this.model.isReadonly()) {
                $select.prop('disabled', true);
            }

            var me = this;
            _.each(schema.options, function(unit) {
                var $option = $('<option>').attr('value', unit).text(unit);
                $select.append($option);
            });

            this.$el.append($select.val(this.unit));
        },

        isComplete: function() {
            var isComplete = true;
            this.$(':text').each(function(i, e) {
                if (!$(e).val()) {
                    isComplete = false;
                    return false;
                }
            });
            if (isComplete && this.$('select').length) {
                isComplete = !!this.$('select').val();
            }

            return isComplete;
        },

        patchValue: function() {
            var value = '';
            this.$('[tag="submit"]').each(function(i, e) {
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

        updateValue: function() {
            if (this.isComplete()) {
                this.model.setValue(this.patchValue());
            } else {
                this.model.setValue(undefined);
            }
        }
    });
});
