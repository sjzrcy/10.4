/**
 * 他的model需要提供如下状态：
 * 1. isInputable
 * 2. value
 * 3. options
 * 4. readonly
 * 5. must
 * 6. unit
 */

define(function(require, exports, module) {
    var MAX_COUNT = 200;

    // 
    var propValue = function(option) {
        if (_.isObject(option)) {
            return option.value;
        }
    };

    //
    var PropSelectView = Backbone.View.extend({
        tagName: 'div',
        className: 'content prop-select clearfix',

        events: {
            'focus .input-value': function() {
                var $input = this.$('.input-value');
                if (this.DefaultText === $input.val()) {
                    $input.val('');
                }

                // 查询，并展示 
                this.updateUL(this.queryOptions(this.model.get('options'), $input.val()),
                    propValue(this.model.value()));

                if (this.$query) {
                    this.$el.append(this.$query);
                    this.$query.show();
                } else {
                    this.$el.append(this.$ul);
                    this.$ul.show();
                }
            },

            'click': function() {
                var $input = this.$('.input-value');
                if (!this.model.isReadonly() && $input.prop('disabled') && as.util.isCoverCursor($input)) {
                    // 查询，并展示 
                    this.updateUL(this.queryOptions(this.model.get('options'), ''), propValue(this.model.value()));

                    if (this.$query) {
                        this.$el.append(this.$query);
                        this.$query.show();
                    } else {
                        this.$el.append(this.$ul);
                        this.$ul.show();
                    }
                }
            },

            'blur .input-value': function() {
                var $input = this.$('.input-value');
                var text = as.util.trimedValue($input);
                if (text !== '') {
                    var options = this.model.get('options');
                    if (this.model.get('inputable') && !as.util.isOptionText(options, text)) {
                        // 支持输入，如果是非合法值，则更新value
                        this.model.setValue({ value: -1, text: text });
                        this.updateText(text);
                    } else {
                        // 设置为当前value对应的text
                        var option = as.util.findOption(options, this.model.value());
                        if (option && option.text !== text) {
                            this.model.setValue({ value: option.value, text: option.text });
                            this.updateText(text);
                        }
                    }
                } else {
                    this.updateText(this.DefaultText);
                }
            },

            'click .show-options-button': function() {
                var matchOptions;
                if (this.$query) {
                    if (!this.model.isReadonly() && this.$query.css('display') === 'none') {
                        matchOptions = this.queryOptions(this.model.get('options'), '');
                        this.updateUL(matchOptions, propValue(this.model.value()));
                        this.$el.append(this.$query);
                        this.$query.show();

                        var me = this;
                        setTimeout(function() {
                            var $query = $('input', me.$query);
                            $query.addClass('input-query-tip');
                            $query.val('搜索');
                            $query.focus();

                            $query.one('keydown', function() {
                                $query.removeClass('input-query-tip');
                                $query.val('');
                            });
                        }, 10);
                    } else {
                        this.$query.hide();
                        this.$query.detach();
                    }
                } else {
                    if (!this.model.isReadonly() && this.$ul.css('display') === 'none') {
                        matchOptions = this.queryOptions(this.model.get('options'), '');
                        this.updateUL(matchOptions, propValue(this.model.value()));

                        this.$el.append(this.$ul);
                        this.$ul.show();
                    } else {
                        this.$ul.hide();
                        this.$ul.detach();
                    }
                }
            }
        },

        initialize: function() {
            this.model.on('readonlyStatusChanged', this.render, this);
            this.model.on('valueUpdated', this.render, this);

            this.OPTION_EMPTY = { value: '', text: '--' };
            this.QUERY_NULL = { value: '', text: '没有匹配选项' };

            // 控制是否展示查询
            this.isShowQuery = false;
            var options = this.model.get('options');
            if (_.isArray(options)) {
                this.isShowQuery = options.length > 20;
            }

            // 默认提示
            var isInputable = (this.model.get('inputable') === true);
            this.DefaultText = isInputable ? '请选择或输入' : '请选择';

            // 兼容，后端无法区分枚举可输入的输入值和普通输入的输入值
            if (isInputable) {
                var value = this.model.value();
                if (_.isString(value) && value) {
                    var option = as.util.findOptionByText(this.model.get('options'), value);
                    this.model.setValue({
                        'value': option ? option.value : -1,
                        'text': value
                    });
                }
            }

            var me = this;
            $('body').click(function(e) {
                me.tryCloseUL(e);
            });
        },

        render: function() {
            //
            this.$el.empty();

            // readonly > inputable
            var isReadonly = this.model.isReadonly();
            var isInputable = (this.model.get('inputable') === true);
            var $input = $('<input class="input-value">').addClass(isInputable ? 'inputable' : '').addClass(isReadonly ? 'readonly' : '');
            $input.prop('disabled', isReadonly || !isInputable);
            $input.bind('textchange', this, this.onTextChange);
            this.$el.append($input);

            var unit = this.model.get('unit');
            if (unit) {
                var $unit = $('<div class="unit">').addClass(isReadonly ? 'readonly' : '').text(unit);
                this.$el.append($unit);

                // 28是后面图标的宽度
                var unitWidth = as.util.measureText(unit).width;
                $input.css('width', 'calc(100% - ' + (28 + unitWidth) + 'px)');
            }

            var $show = $('<div>').addClass('show-options-button').addClass(isReadonly ? 'readonly' : '');
            this.$el.append($show);

            var value = this.model.value();
            if (_.isObject(value) && value.value) {
                var options = this.model.get('options');
                var option = as.util.findOption(options, value.value);
                $input.val(option ? option.text : (isInputable ? (value.text) : this.DefaultText));
            } else {
                $input.addClass('default-text').val(this.DefaultText);
            }

            this.$ul = $('<ul class="asselect-ul">').css('display', 'none');
            if (!isInputable) {
                if (this.isShowQuery) {
                    this.$query = $('<div class="query"><input class="input-query"/><div class="search-icon"></div></div>').css('display', 'none');
                } else {
                    this.$query = $('<div class="query"></div>').css('display', 'none');
                }
                this.$ul.show();
                this.$query.append(this.$ul);

                // bind 
                $('input', this.$query).bind('textchange', this, this.onTextChange);
            }
        },

        onTextChange: function(e) {
            // 查询，并展示 
            var me = e.data;
            var query = me.$query ? me.$('.input-query').val() : me.$('.input-value').val();
            var matchOptions = me.queryOptions(me.model.get('options'), query);
            me.updateUL(matchOptions, propValue(me.model.value()));
        },

        updateUL: function(options, currentValue) {
            if (options.length === 0) {
                options.push(this.QUERY_NULL);
            }

            if (!this.model.get('must')) {
                options.unshift(this.OPTION_EMPTY);
            }

            this.$ul.empty();
            this.renderTip(this.$ul);

            var me = this;
            _.each(options, function(option) {
                var $li = $('<li>').data('value', option.value).attr('text', option.text).html('&nbsp;' + option.text)
                    .addClass(String(currentValue) === String(option.value) ? 'current' : '')
                    .click(function() {
                        var value = $(this).data('value');
                        var text = $(this).attr('text');
                        me.select(value, text);
                    });

                me.$ul.append($li);
            });
        },

        renderTip: function($ul) {
            var tip = this.model.get('optiontip');
            if (_.isString(tip) && tip.length > 0) {
                var $li = $('<li>').html('<nobr>&nbsp;' + tip + '&nbsp;</nobr>');
                as.util.handleATag($li);
                $ul.append($li);
            }
        },

        select: function(value, text) {
            log('prop select', value, text);
            if (this.$query) {
                this.$query.hide();
            } else {
                this.$ul.hide();
            }

            this.model.setValue(value !== '' ? { value: value, text: text } : undefined);
            this.updateText(value ? text : this.DefaultText);
        },

        tryCloseUL: function(e) {
            var isClickButton;
            var isClickQuery;
            var isClickInput;

            if (this.$query) {
                if (this.$query.css('display') !== 'none') {
                    isClickButton = as.util.isContain(this.$('.show-options-button'), $(e.target));
                    isClickQuery = this.isShowQuery ? as.util.isContain(this.$('.input-query'), $(e.target)) : false;
                    isClickInput = as.util.isCoverCursor(this.$('.input-value'));
                    if (!isClickButton && !isClickQuery && !isClickInput) {
                        this.$query.hide();
                        this.$query.detach();
                    }
                }
            } else {
                if (this.$ul.css('display') !== 'none') {
                    isClickButton = as.util.isContain(this.$('.show-options-button'), $(e.target));
                    isClickInput = as.util.isCoverCursor(this.$('.input-value'));
                    if (!isClickButton && !isClickInput) {
                        this.$ul.hide();
                        this.$ul.detach();
                    }
                }
            }
        },

        queryOptions: function(options, key) {
            var querys = [];
            var current;
            var currentIndex;
            var value = propValue(this.model.value());

            key = key.toLowerCase();
            _.each(options, function(option, index) {
                var lower = option.text.toLowerCase();
                if (lower.indexOf(key) !== -1) {
                    querys.push(option);

                    // 记录当前项和其在匹配结果中的位置
                    if (value && option.value == value) {
                        current = _.extend({}, option);
                        currentIndex = querys.length - 1;
                    }
                }
            });

            var isQuery = !!key;
            if (!isQuery && querys.length > MAX_COUNT) {
                querys = querys.slice(0, MAX_COUNT);
                if (current && currentIndex && currentIndex >= MAX_COUNT) {
                    querys.push(current);
                }
            }

            return querys;
        },

        updateText: function(text) {
            var $input = this.$('.input-value');
            $input.val(text);
            if (this.DefaultText === text) {
                $input.addClass('default-text');
                this.model.setValue(undefined);
            } else {
                $input.removeClass('default-text');
            }
        }

    });

    //
    module.exports = PropSelectView;
});
