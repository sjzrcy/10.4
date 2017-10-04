/**
 * IN:
 * field
 * extend
 *
 * MIN 始终保持一个当前最小负数，操作时依次递减
 */

define(function(require, exports, module) {
    //
    var ColorOptionsPanel = require('src/schema/ui/sku/metas/color/options');
    var ImagePreview = require('src/base/common/imagepreview');
    var adjuster = require('src/base/datatype-adjuster');

    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'sku-color',

        events: {
            'click :checkbox': function() {
                var $checkbox = $(event.srcElement);
                if ($checkbox.prop('checked')) { // 勾选空项
                    this.$el.append(this.emptyItem());
                    $checkbox.siblings('.color-alias').focus();
                } else { // 取消勾选
                    var $alias = $checkbox.siblings('.color-alias');
                    var vid = $alias.data('vid');
                    if (vid) {
                        this.removeValue(vid);
                    }

                    $checkbox.parent().remove();
                    this.tryClearError();
                }
            },

            'focus .color-tip': function() {
                var $input = $(event.srcElement);
                if ($input.hasClass('default-text')) {
                    $input.removeClass('default-text').val('');
                }
            },

            'blur .color-tip': function() {
                var $input = $(event.srcElement);
                var value = as.util.trimedValue($input);
                if (value === '') {
                    var defaultText = $input.attr('default-text');
                    $input.addClass('default-text').val(defaultText);
                }

                var last = $input.attr('last');
                if (last !== value) {
                    $input.attr('last', value);
                    var $colorItem = $input.parent();
                    this.updateValue($colorItem);
                }
            },

            'focus .color-alias': function() {
                var $input = $(event.srcElement);
                if ($input.hasClass('default-text')) {
                    $input.removeClass('default-text').val('');
                    this.optionsPanel.show($input);
                }

                var $checkbox = $input.siblings(':checkbox');
                if (!$checkbox.prop('checked')) {
                    $checkbox.prop('checked', true);
                    this.$el.append(this.emptyItem());
                }
            },

            'blur .color-alias': function(e, $input, forbidClearError) {
                if (!$input) { //默认是不传递$input的，如果传了，其优先级最高
                    $input = $(event.srcElement);
                }

                var value = as.util.trimedValue($input);
                var defaultText;
                if (value === '') {
                    defaultText = $input.attr('default-text');
                    $input.addClass('default-text').data('vid', undefined).data('last', undefined).val(defaultText);
                }

                var last = $input.data('last');
                if (last !== value) {
                    $input.data('last', value);
                    var lastVid = $input.data('vid');
                    if (lastVid) {
                        this.removeValue(lastVid);
                    }

                    var $colorItem = $input.parent();
                    var vid = this.findOptionValue(value);
                    if (this.isValueRepeat(value)) { // 颜色重复-报错
                        this.removeErrorTip('alias');
                        if ($('[type=alias]', $colorItem).length === 0) {
                            var repeatText = this.getRepeatTip(value);
                            $colorItem.append(this.errorTip('alias', repeatText));
                        }
                    } else if (!this.extend.alias && !vid && defaultText !== value && value) { // 不允许别名，而输入了自定义名字
                        if ($('[type=extendalias]', $colorItem).length === 0) {
                            $colorItem.append(this.errorTip('extendalias', '只允许使用系统定义的颜色值'));
                        }
                    } else if (value !== '') { // 更新元数据
                        this.removeErrorTip('alias', $colorItem);
                        this.removeErrorTip('extendalias', $colorItem);
                        if (vid) {
                            $input.attr('custom', false).data('vid', vid);
                        } else {
                            $input.attr('custom', true).data('vid', (this.MIN -= 1));
                        }

                        this.updateValue($colorItem, $colorItem.index());

                        // 尝试清理其他错误选项
                        if (!forbidClearError) {
                            this.tryClearError();
                        }
                    }
                }

                if (this.optionsPanel.isVisible()) {
                    this.optionsPanel.hide(true);
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
                            me.setColorItemImage($upload, url);

                            var $image = $upload.parent();
                            $image.attr('value', url);

                            var $colorItem = $image.parent();
                            me.updateValue($colorItem);
                        }
                    }
                });
            },

            'click .preview-image .image': function() {
                var url = $(event.srcElement).parent().parent().attr('value');
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
                $image.attr('value', '');

                // update data
                var $colorItem = $image.parent();
                this.updateValue($colorItem, $colorItem.index());
            },

            'click .color-item': function() {
                // 如果支持别名就不用处理了
                if (this.extend.alias) {
                    return;
                }

                var $item = $(event.srcElement);
                while ($item && !$item.hasClass('color-item')) {
                    $item = $item.parent();
                }

                var $input = $('.color-alias', $item);
                if (as.util.isCoverCursor($input)) {
                    this.optionsPanel.show($input);
                    var $checkbox = $input.siblings(':checkbox');
                    if (!$checkbox.prop('checked')) {
                        $checkbox.prop('checked', true);
                        this.$el.append(this.emptyItem());
                    }
                }
            }
        },

        initialize: function() {
            this.MIN = 0;
            this.color = this.model;
            this.extend = {
                alias: !!this.color.get('custom'),
                tip: !!this.color.get('remark'),
                image: !!this.color.get('image')
            };

            this.AliasDefaultText = this.extend.alias ? '请选择/输入主色' : '请选择主色';
            this.optionsPanel = new ColorOptionsPanel({ model: this.color.get('options'), alias: this.extend.alias });
            this.optionsPanel.on('selected', this.onColorSelected, this);
            this.optionsPanel.render();
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

            this.$el.append(this.emptyItem());
        },

        renderItem: function(option) {
            var $item = $('<div class="color-item">');
            $item.append($('<input type="checkbox">').prop('checked', true));

            var alias = option.alias ? option.alias : option.text;
            var $alias = $('<input class="color-alias">').attr('default-text', this.AliasDefaultText).data('vid', option.value).attr('last', alias).val(alias);
            $alias.bind('textchange', this.aliasChangedHandler());
            if (!this.extend.alias) {
                $alias.prop('disabled', true).css('background-color', '#f6f6f6');
            }
            $item.append($alias);

            // 备注
            if (this.extend.tip) {
                var $tip = $('<input class="color-tip">').attr('default-text', '备注').attr('last', option.tip)
                    .val(option.tip ? option.tip : '备注').addClass(option.tip ? '' : 'default-text');
                $tip.prop('disabled', !this.extend.tip);
                $item.append($tip);
            } else {
                $alias.css('width', '248px');
            }

            // 图片
            if (this.extend.image) {
                var $image = this.renderImage(option.imgUrl);
                $item.append($image);
            }

            // 增加图标
            if (!this.extend.alias) {
                var $icon = $('<div class="select-icon">');
                $item.append($icon);
            }

            return $item;
        },

        renderImage: function(image) {
            var $upload = $('<div class="upload-image">').text('上传图片')
                .css('display', (image ? 'none' : 'block'));
            var $preview = $('<div class="preview-image"><span class="image"></span><span class="remove-image">删除</span></div>')
                .css('display', (image ? 'block' : 'none'));

            if (image) {
                $('.image', $preview).css('background-image', 'url("' + encodeURI(image) + '")');
            }

            return ($('<div class="color-image">').attr('value', image)).append($upload).append($preview);
        },

        emptyItem: function() {
            var $item = $('<div class="color-item">');
            $item.append($('<input type="checkbox">'));

            var $alias = $('<input class="color-alias">').attr('default-text', this.AliasDefaultText).addClass('default-text').val(this.AliasDefaultText);
            $alias.bind('textchange', this.aliasChangedHandler());
            if (!this.extend.alias) {
                $alias.prop('disabled', true).css('background-color', '#f6f6f6');
            }
            $item.append($alias);

            // 备注
            if (this.extend.tip) {
                var $tip = $('<input class="color-tip">').attr('default-text', '备注').addClass('default-text').val('备注');
                $tip.prop('disabled', !this.extend.tip);
                $item.append($tip);
            } else {
                $alias.css('width', '248px');
            }

            // 图片
            if (this.extend.image) {
                var $image = this.renderImage();
                $item.append($image);
            }

            // 增加图标
            if (!this.extend.alias) {
                var $icon = $('<div class="select-icon">');
                $item.append($icon);
            }

            return $item;
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

        findOptionValue: function(text) {
            var value;
            var options = this.color.get('options');
            _.find(options, function(option) {
                if (option.text === text) {
                    value = option.value;
                    return true;
                }
            });

            return value;
        },

        removeValue: function(vid) {
            var findIndex;
            var colorId = this.color.id;
            var colors = this.color.value();
            _.find(colors, function(color, i, list) {
                if (color.value === vid) {
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

            // 当为空时，无需保存
            var $alias = $('.color-alias', $colorItem);
            if ($alias.hasClass('default-text')) {
                return;
            }

            var colorOption = {};
            colorOption.value = $alias.data('vid');
            colorOption.text = $alias.val();

            if (this.extend.alias) {
                colorOption.alias = '';
                if (colorOption.value < 0) {
                    colorOption.alias = $alias.val();
                }
            }

            if (this.extend.tip) {
                colorOption.tip = '';
                var $tip = $('.color-tip', $colorItem);
                if (!$tip.hasClass('default-text')) {
                    colorOption.tip = $tip.val();
                }
            }

            colorOption.imgUrl = $('.color-image', $colorItem).attr('value');
            // update color field
            var colorValues = this.color.value();
            if (!_.isArray(colorValues)) {
                colorValues = [];
            }

            var colorValue = _.find(colorValues, function(colorValue) {
                return (colorValue.value === colorOption.value);
            });

            if (!colorValue) { // 插入（新增或者更改vid）
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
        },

        aliasChangedHandler: function() {
            var me = this;
            var handler = function() {
                var $alias = $(this);
                if ($alias.val() === '') {
                    if (!me.optionsPanel.isVisible()) {
                        me.optionsPanel.show($alias);
                    }
                } else {
                    if (me.optionsPanel.isVisible()) {
                        me.optionsPanel.hide();
                    }
                }
            };

            return handler;
        },

        onColorSelected: function(context) {
            var option = context.option;
            var $input = context.host;
            $input.removeClass('default-text').val(option.text);
            $input.trigger('blur', [$input]); // jQuery的trigger参数传递需要使用数组
        },

        isValueRepeat: function(text) {
            var colorValues = this.color.value();
            var isRepeat = false;

            var me = this;
            _.find(colorValues, function(colorValue) {
                if (colorValue.text === text) {
                    isRepeat = true;
                    return true;
                }
            });

            return isRepeat;
        },

        getRepeatTip: function(text) {
            var colorValues = this.color.value();
            var me = this;
            var colorValue = _.find(colorValues, function(colorValue) {
                if (colorValue.text === text) {
                    return true;
                }
            });

            var colorText = text;
            if (colorValue.alias) {
                colorText += '(' + colorValue.alias + ')';
            }

            var tip = '与"' + colorText + '"重复，请修改';
            return tip;
        },

        errorTip: function(type, text) {
            return $('<div class="color-error-tip"><span class="error-icon"></span><span class="error-text">' + text + '</span></div>').attr('type', type);
        },

        removeErrorTip: function(type, $colorItem) {
            $('[type=' + type + ']', $colorItem).remove();
        },

        tryClearError: function() {
            var me = this;
            this.$('.color-item').each(function(i, e) {
                var $item = $(e);
                if ($('.color-error-tip', $item).length > 0) {
                    var $alias = $('.color-alias', $item);
                    var vid = $alias.data('vid');
                    if (!me.isValueRepeat(vid)) {
                        $alias.data('last', '0');
                        $alias.trigger('blur', [$alias, true]);
                    }
                }
            });
        }
    });

    //
    module.exports = View;
});
