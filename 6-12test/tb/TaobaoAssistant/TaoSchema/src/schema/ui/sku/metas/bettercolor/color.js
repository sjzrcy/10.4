/**
 *
 * MIN 始终保持一个当前最小负数，操作时依次递减
 *
 */

define(function(require, exports, module) {
    //
    var GroupOptionsPanel = require('src/schema/ui/sku/metas/bettercolor/groupoptions');
    var QueryOptionsPanel = require('src/schema/ui/sku/metas/bettercolor/queryoptions');
    var ImagePreview = require('src/base/common/imagepreview');
    var Tooltip = require('src/schema/ui/base/tooltip');

    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'sku-color2',

        events: {
            'click :checkbox': function() {
                var $checkbox = $(event.srcElement);
                if ($checkbox.prop('checked')) { // 勾选空项
                    if (!this.isExceedCustomMaxSize()) {
                        this.$el.append(this.emptyItem());
                        if (this.extend.custom) {
                            $checkbox.siblings('.color-input').focus();
                        } else {
                            var me = this;
                            this.showQueryDialog($checkbox.parent(), function(option) {
                                // 设置button的值
                                me.updateColorButton(option, $checkbox.siblings('.color-button'));
                                me.updateValue($checkbox.parent());
                            });
                        }
                    }

                } else { // 取消勾选
                    var value;
                    if (this.extend.custom) {
                        var $input = $checkbox.siblings('.color-input');
                        value = $input.data('value');
                    } else {
                        // 从button取值，并移除
                        var $button = $checkbox.siblings('.color-button');
                        value = $('.color-block', $button).data('value');
                    }

                    this.removeValue(value);
                    $checkbox.parent().remove();

                    // 没有空项了，自动增加一项
                    if (!this.hasEmptyItem() && !this.isExceedCustomMaxSize()) {
                        this.$el.append(this.emptyItem());
                    }
                }
            },

            'focus .color-remark': function() {
                this.closeAllPanel();
            },

            'blur .color-remark': function() {
                var $input = $(event.srcElement);
                var value = as.util.trimedValue($input);
                var last = $input.data('last');

                // 最大长度规则
                if (this.remarkMaxLength && as.util.bytes(value) > this.remarkMaxLength) {
                    value = as.util.subBytes(value, this.remarkMaxLength);
                    as.util.showErrorTip('颜色备注最大长度为' + this.remarkMaxLength + '(' + this.remarkMaxLength / 2 + '个汉字)，已自动截断为：' + value);
                    $input.val(value);
                }

                if (last !== value) {
                    $input.data('last', value);
                    var $colorItem = $input.parent();
                    this.updateValue($colorItem);
                }
            },

            'focus .color-input': function() {
                var $input = $(event.srcElement);
                var $checkbox = $input.siblings(':checkbox');
                if (!$checkbox.prop('checked')) {
                    $checkbox.prop('checked', true);
                    if (!this.isExceedCustomMaxSize()) {
                        this.$el.append(this.emptyItem());
                    }
                }

                var me = this;
                if ($input.val()) {
                    this.doNetQuery($input.val(), $input);
                } else {
                    this.showGroupDialog($input.parent(), function(option) {
                        if (me.isColorTextRepeat($input.parent(), option.text)) {
                            as.util.showErrorTip('颜色不可重复，请重新选择');
                        } else {
                            me.updateColorOption(option, $input);
                        }
                    });
                }
            },

            'change .color-input': function() {
                var $input = $(event.srcElement);
                var text = $input.val();
                if (this.customMaxLength && as.util.bytes(text) > this.customMaxLength) {
                    $input.val('');
                    this.removeValue($input.data('value'));
                    as.util.showErrorTip('自定义颜色的最大长度为' + this.customMaxLength + '(' + this.customMaxLength / 2 + '个汉字)');
                    return;
                }

                if (text) {
                    var me = this;
                    var block = function() {
                        if (me.isColorTextRepeat($input.parent(), $input.val())) {
                            $input.val('');
                            me.removeValue($input.data('value'));
                            as.util.showErrorTip('颜色不可重复，请重新选择');
                        } else {
                            me.updateColorText(text, $input);
                            me.doNetCheck(text, $input);
                        }
                    };

                    // 有查询面板，判定为-可能是点击匹配项输入
                    if (this.queryPanel) {
                        this.queryPanel.setExCloseCb(function() {
                            if (!me.queryPanel.text()) { // 没有值，使用默认
                                block();
                            }
                        });
                    } else {
                        block();
                    }
                } else {
                    this.removeValue($input.data('value'));
                }
            },

            'click .upload-image': function() {
                var $upload = $(event.srcElement);
                var me = this;
                as.shell.choosePictures(function(images) {
                    if (_.isString(images) && images.length > 0) {
                        images = images.split(',');
                        if (images.length > 0) {
                            var url = images[images.length - 1];
                            var $image = $upload.parent();
                            me.setColorItemImage($upload, url);
                            me.updateValue($image.parent(), $image.parent().index());
                        }
                    }
                });
            },

            'click .preview-image .image': function() {
                var url = $(event.srcElement).parent().parent().data('value');
                var preview = new ImagePreview(url);
                preview.show();
            },

            'click .preview-image .remove-image': function() {
                var $remove = $(event.srcElement);
                $remove.siblings('.image').css('background-image', '');

                // hide
                var $preview = $remove.parent();
                $preview.hide();

                // show
                var $upload = $preview.siblings('.upload-image');
                $upload.show();

                // reset
                var $image = $preview.parent();
                $image.data('value', '');

                // update data
                var $colorItem = $image.parent();
                this.updateValue($colorItem, $colorItem.index());
            },

            'click .color-button': function() {
                var $src = $(event.srcElement);
                var $button = $src;
                while (!$button.hasClass('color-button')) {
                    $button = $button.parent();
                }

                var me = this;
                this.showGroupDialog($button.parent(), function(option) {
                    if (me.isColorTextRepeat($button.parent(), option.text)) {
                        as.util.showErrorTip('颜色不可重复，请重新选择');
                        return;
                    }

                    var $checkbox = $button.siblings(':checkbox');
                    if (!$checkbox.prop('checked')) {
                        $checkbox.prop('checked', true);
                        me.$el.append(me.emptyItem());
                    }

                    var lastValue = $('.color-block', $button).data('value');
                    if (lastValue != option.value) {
                        me.removeValue(lastValue);
                    }

                    me.updateColorButton(option, $button);
                    me.updateValue($button.parent(), $button.parent().index());
                });
            }
        },

        initColorConfig: function() {
            var config = {};
            var options = [];
            var groups = this.model.get('groups');
            for (var i = 0; i < groups.length; ++i) {
                var group = groups[i];
                options = options.concat(group.colors);

                for (var j = 0; j < group.colors.length; ++j) {
                    // 颜色和图片，都在rgb中
                    var option = group.colors[j];
                    config[option.value] = option.rgb;
                }
            }

            // 加速色块查询
            this.config = config;

            // 设置全量枚举项，偏于查询
            this.model.set('options', options);

            // 设置颜色的查询和检查异步
            var getAsync = function(action, asyncArray) {
                return (_.find(asyncArray, function(async) {
                    return (async.action() === action);
                }));
            }

            this.query = getAsync('querycolor', this.color.get('async'));
            this.check = getAsync('checkcolor', this.color.get('async'));

            // 关于备注的规则 - remarkMaxLength
            var remark = this.color.get('remark');
            if (_.isObject(remark) && remark.maxLength) {
                this.remarkMaxLength = remark.maxLength;
            }

            // 关于自定义的规则 - custom
            var custom = this.color.get('custom');
            if (_.isObject(custom)) {
                if (custom.maxLength) {
                    this.customMaxLength = custom.maxLength;
                }
                if (custom.maxSize) {
                    this.customMaxSize = custom.maxSize;
                }
            }
        },

        initialize: function() {
            this.MIN = 0;
            this.color = this.model;
            this.extend = {
                custom: !!this.color.get('custom'),
                remark: !!this.color.get('remark'),
                image: !!this.color.get('image')
            };

            this.initColorConfig();
        },

        render: function() {
            var colorValues = this.color.value();
            var colorId = this.color.id;

            var me = this;
            _.each(colorValues, function(option) {
                // fix：从后端来的option，可能text为空，对标准option做兼容处理
                if (!option.text) {
                    option.text = me.color.findOptionText(option.value);
                }

                var $item = me.renderItem(option);
                me.$el.append($item);

                // 维护当前自定义值的最小vid
                if (_.isNumber(option.value) && option.value < 0 && option.value < me.MIN) {
                    me.MIN = option.value;
                }
            });

            if (!this.isExceedCustomMaxSize()) {
                this.$el.append(this.emptyItem());
            }
        },

        renderItem: function(option) {
            var $item = $('<div class="color-item">');
            $item.append($('<input type="checkbox">').prop('checked', true));

            if (this.extend.custom) { // 支持自定义
                $item.append(this.renderCustomInput(option));
            } else { // 不支持自定义
                $item.append(this.renderColorButton(option));
            }

            if (this.extend.remark) { // 备注
                $item.append(this.renderRemark(option));
            }

            if (this.extend.image) { // 图片
                $item.append(this.renderImage(option));
            }

            return $item;
        },

        renderCustomInput: function(option) {
            var $input = $('<input class="color-input" placeholder="请选择/输入主色">')
                .data('value', option.value)
                .data('last', option.text)
                .val(option.text);

            $input.bind('textchange', this.getTextChangedHandler());
            return $input;
        },

        renderColorButton: function(option) {
            var $button = $('<span class="color-button">');
            $button.append($('<span class="color-tip">').text('选择主色'));
            $button.append($('<span class="color-block">'));
            $button.append($('<span class="color-text">').text(option.text ? option.text : ''));

            this.updateColorButton(option, $button);
            return $button;
        },

        updateColorButton: function(option, $button) {
            if (option.value) {
                $('.color-tip', $button).css('display', 'none');
                $('.color-text', $button).text(option.text).css('display', 'inline-block');

                var css = this.config[option.value];
                if (_.isString(css) && css.indexOf('#') === 0) {
                    $('.color-block', $button).data('value', option.value).css('background-color', css).css('display', 'inline-block');
                } else {
                    $('.color-block', $button).data('value', option.value).css('background-image', css).css('display', 'inline-block');
                }
            } else {
                $('.color-tip', $button).css('display', 'inline-block');
                $('.color-block', $button).data('value', '').css('background-image', '#ffffff').css('display', 'none');
                $('.color-text', $button).text('').css('display', 'none');
            }
        },

        renderRemark: function(option) {
            var $remark = $('<input class="color-remark" placeholder="备注">')
                .data('last', option.remark)
                .val(option.remark);

            return $remark;
        },

        renderImage: function(option) {
            var $upload = $('<div class="upload-image">').text('上传图片')
            var $preview = $('<div class="preview-image"><span class="image"></span><span class="remove-image">删除</span></div>');
            var $image = ($('<div class="color-image">').data('value', image)).append($upload).append($preview);

            var image = option.imgUrl;
            if (image) {
                $('.image', $preview).css('background-image', 'url("' + encodeURI(image) + '")');
                $upload.hide();
            } else {
                $preview.hide();
            }

            return $image;
        },

        isExceedCustomMaxSize: function() {
            var max = this.customMaxSize;
            if (!max || isNaN(Number(max))) {
                return false;
            }

            var count = 0;
            this.$('.color-item').each(function(i, e) {
                var $input = $('input.color-input', $(e));
                if ($input.length === 1) {
                    var value = Number($input.data('value'));
                    if (isNaN(value) || value < 0) {
                        count += 1;
                    }
                }
            });

            return count >= this.customMaxSize;
        },

        hasEmptyItem: function() {
            var hasEmptyItem = false;
            this.$('.color-item').each(function(i, e) {
                var $checkbox = $(':checkbox', $(e));
                if (!$checkbox.prop('checked')) {
                    hasEmptyItem = true;
                    return false;
                }
            });

            return hasEmptyItem;
        },

        emptyItem: function() {
            var $item = $('<div class="color-item">');
            $item.append($('<input type="checkbox">'));

            var option = {};
            if (this.extend.custom) { // 支持自定义
                $item.append(this.renderCustomInput(option));
            } else { // 不支持自定义
                $item.append(this.renderColorButton(option));
            }

            if (this.extend.remark) { // 备注
                $item.append(this.renderRemark(option));
            }

            if (this.extend.image) { // 图片
                $item.append(this.renderImage(option));
            }

            return $item;
        },

        isColorTextRepeat: function($colorItem, text) {
            var isRepeat = false;
            var isCustom = this.extend.custom;
            $colorItem.siblings().each(function(i, e) {
                var otherText;
                if (isCustom) {
                    otherText = $('.color-input', $(e)).val();
                } else {
                    otherText = $('.color-button .color-text', $(e)).text();
                }

                if (text === otherText) {
                    isRepeat = true;
                    return false;
                }
            });

            return isRepeat;
        },

        findOptionText: function(vid) {
            var text;
            var options = this.color.get('options');
            _.find(options, function(option) {
                if (option.value == vid) { // jshint ignore:line 
                    text = option.text;
                    return true;
                }
            });

            return text;
        },

        removeValue: function(value) {
            var findIndex;
            var colors = this.color.value();
            _.find(colors, function(color, i) {
                if (color.value === value) {
                    findIndex = i;
                    return true;
                }
            });

            if (!_.isUndefined(findIndex)) {
                colors.splice(findIndex, 1);
                this.color.setValue(colors);
            }
        },

        updateValue: function($colorItem, index) {
            // 如果当前节点存在错误，则不要写入
            if ($('.color-error-tip', $colorItem).length > 0) {
                return;
            }

            var value, text;
            if (this.extend.custom) {
                var $input = $('.color-input', $colorItem);
                text = $input.val();
                value = $input.data('value');
            } else {
                var $button = $('.color-button', $colorItem);
                text = $('.color-text', $button).text();
                value = $('.color-block', $button).data('value');
            }

            // 主色不能为空
            if (!text || !value) {
                return;
            }

            var colorOption = {
                text: text,
                value: value
            };

            if (this.extend.remark) {
                colorOption.remark = $('.color-remark', $colorItem).val();
            }

            if (this.extend.image) {
                colorOption.imgUrl = $('.color-image', $colorItem).data('value');
            }

            // update color field
            var colorValues = this.color.value();
            if (!_.isArray(colorValues)) {
                colorValues = [];
            }

            var colorValue = _.find(colorValues, function(colorValue) {
                return (colorValue.value === colorOption.value);
            });

            if (!colorValue) { // 插入（更改时在插入前会删除）
                colorValues.splice(index, 0, colorOption);
                this.color.setValue(colorValues);
            } else { // 更新扩展项
                _.extend(colorValue, colorOption);
            }
        },

        setColorItemImage: function($upload, url) {
            var $preview = $upload.siblings('.preview-image');
            var $image = $('.image', $preview);
            $image.css('background-image', 'url("' + encodeURI(url) + '")');

            $upload.hide();
            $preview.show();

            var colorImage = $upload.parent();
            colorImage.data('value', url);
        },

        getTextChangedHandler: function() {
            var me = this;
            var doTextChanged = function() {
                var $input = $(this);
                me.removeCheckIcon($input);

                var text = $input.val();
                if (text) {
                    me.doNetQuery(text, $input);
                } else {
                    me.showGroupDialog($input.parent(), function(option) {
                        if (me.isColorTextRepeat($input.parent(), option.text)) {
                            as.util.showErrorTip('颜色不可重复，请重新选择');
                        } else {
                            me.updateColorOption(option, $input);
                        }
                    });
                }
            };

            return doTextChanged;
        },

        doNetQuery: function(text, $input) {
            if (!this.query) {
                return;
            }

            var me = this;
            this.query.doQuery(text, function(options) {
                if (_.isArray(options) && options.length > 0) {
                    me.showQueryDialog($input.parent(), text, options, function(text) {
                        if (me.isColorTextRepeat($input.parent(), text)) {
                            as.util.showErrorTip('颜色不可重复，请重新选择');
                        } else {
                            me.updateColorText(text, $input);
                        }
                    });
                } else {
                    me.closeAllPanel();
                }
            });
        },

        doNetCheck: function(text, $input) {
            if (!this.check) {
                return;
            }

            var me = this;
            this.check.doCheck(text, function(result) {
                if (_.isObject(result) && result.level && result.tip) {
                    me.updateCheckIcon(result.level, result.tip, $input);
                } else {
                    me.removeCheckIcon($input);
                    if (result && result.valueId) {
                        // 如果是选中了标准色，先移除之前的自定义，再设置vid,并更新
                        me.removeValue($input.data('value'));
                        var text = $input.val();
                        if (!me.isColorTextRepeat($input.parent(), text)) {
                            $input.data('value', result.valueId);
                            me.updateColorOption({ text: text, value: result.valueId }, $input);
                        } else {
                            $input.val('');
                            me.removeValue($input.data('value'));
                            as.util.showErrorTip('颜色不可重复，请重新选择');
                        }
                    }
                }
            });
        },

        updateCheckIcon: function(level, text, $input) {
            var $colorItem = $input.parent();
            var $checkTip = $('.color-text-check-tip', $colorItem);
            if ($checkTip.length === 0) {
                $checkTip = $('<div class="color-text-check-tip">');
                $colorItem.append($checkTip);
            }

            if (level === 'error') {
                $checkTip.css('background-image', 'url(../img/error.png)');
            } else {
                $checkTip.css('background-image', 'url(../img/warn.png)');
            }

            var tooltip = $checkTip.data('tooltip');
            if (tooltip && tooltip.$el) {
                tooltip.$el.remove();
                tooltip.$el = undefined;
                tooltip = undefined;
            }

            tooptip = new Tooltip($checkTip, text);
            $checkTip.data('tooptip', tooptip);
            $checkTip.unbind('mouseenter').unbind('mouseleave');
            $checkTip.hover(function() {
                tooptip.show();
            }, function() {
                tooptip.hide();
            });
        },

        removeCheckIcon: function($input) {
            $('.color-text-check-tip', $input.parent()).remove();
        },

        // 通过分组panel选值
        updateColorOption: function(option, $input) {
            var lastValue = $input.data('value');
            if (lastValue != option.value) {
                this.removeValue(lastValue);
            }

            $input.data('value', option.value).val(option.text);
            this.updateValue($input.parent(), $input.parent().index());
        },

        updateColorText: function(text, $input) {
            var last = $input.data('last');
            if (last === text) {
                return;
            }

            $input.data('last', text).val(text);
            if (!$input.data('value')) {
                $input.data('value', (this.MIN -= 1));
            }

            this.updateValue($input.parent(), $input.parent().index());
            this.doNetCheck(text, $input);
        },

        closeAllPanel: function() {
            if (this.groupPanel) {
                this.groupPanel.close();
                this.groupPanel = undefined;
            }
            if (this.queryPanel) {
                this.queryPanel.close();
                this.queryPanel = undefined;
            }
        },

        showGroupDialog: function($rel, cb) {
            this.closeAllPanel();

            var me = this;
            this.groupPanel = new GroupOptionsPanel({
                model: {
                    $rel: $rel,
                    offset: { x: 28, y: 13 },
                    closeCb: function() {
                        var value = me.groupPanel ? me.groupPanel.value() : '';
                        if (value && _.isFunction(cb)) {
                            cb(value);
                        }
                    },
                    groups: this.model.get('groups')
                }
            });

            this.groupPanel.render();
            this.groupPanel.show();
        },

        showQueryDialog: function($rel, query, options, cb) {
            this.closeAllPanel();

            var me = this;
            this.queryPanel = new QueryOptionsPanel({
                model: {
                    $rel: $rel,
                    offset: { x: 29, y: 13 },
                    closeCb: function() {
                        var text = me.queryPanel ? me.queryPanel.text() : '';
                        if (text && _.isFunction(cb)) {
                            cb(text);
                        }
                    },
                    query: query,
                    options: options
                }
            });

            this.queryPanel.render();
            this.queryPanel.show();
        }
    });

    //
    module.exports = View;
});
