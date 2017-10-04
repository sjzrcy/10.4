/**
 * 状态：
 * 1.无值，显示添加样式
 * 2.有值，显示背景图以及删除交互（preview）
 * 
 * 接口：
 * 1.setValue(url),设置当前图片
 * 2.reset，清空值，回归初始状态
 *
 * IN:
 * valueIndex：在model中，值为数组，当前所处的位置
 * parent：容器
 * field：对应的model（image）
 * mode：容器当前的模式（支持5还是6个项）
 * index: 在容器中的序号
 */

define(function(require, exports, module) {
    //
    var Tip = require('src/base/common/dialog/tip');
    var getConfig = function(field, index) {
        var config = {};
        var optionConfig = field.get('optionConfig');
        if (_.isObject(optionConfig)) {
            config = optionConfig[String(index)];
        }

        if (_.isEmpty(config)) {
            config = {
                text: (index === 0 ? '主图第一张' : '主图'),
                required: (index === 0)
            };
        }

        return config;
    };

    //
    var View = Backbone.View.extend({
        initialize: function() {

        },

        render: function() {
            var me = this;
            this.$thumbnail = $('<span class="sub">');
            this.renderThumbnail();
            this.$thumbnail.click(function() {
                me.onClick(me.$thumbnail);
            });

            this.$preview = $('<div class="preview-image">');
            this.renderPreview();
            this.$preview.click(function() {
                me.onClick(me.$preview);
            });
        },

        deduplicate: function(images) {
            var rawImages = this.model.field.value();
            var isExsit;
            var allCount = images.length;
            var removeCount = 0;
            for (var i = images.length - 1; i >= 0; --i) {
                isExsit = false;
                var image = images[i];
                _.find(rawImages, function(rawImage) {
                    if (_.isObject(rawImage) && rawImage.url === image) {
                        isExsit = true;
                        return true;
                    }
                });

                if (isExsit) { // 去重
                    images.splice(i, 1);
                    removeCount += 1;
                }
            }

            if (removeCount > 0) {
                (new Tip({
                    model: {
                        'text': '共选择' + allCount + '张图片，其中由于同一张图片不能多次添加，自动移除' + removeCount + '张重复图片，请确认！',
                        'icon': '../img/tip-warn.png',
                        'time': 3000
                    }
                })).render();
            }

            return images;
        },

        renderThumbnail: function() {
            this.$arrow = $('<div>').addClass('arrow');
            this.$image = $('<div>').addClass('thumbnail' + this.model.mode);
            this.$thumbnail.append(this.$arrow).append(this.$image);

            var value = this.getValue();
            if (!value) {
                this.$image.text('+');
            } else {
                this.$image.data('url', value).css('background-image', 'url("' + encodeURI(value) + '")');
            }

            var me = this;
            this.$image.hover(function() { //鼠标hover时抢占焦点
                me.model.parent.active(me.model.index);
            }, function() {});

            this.$image.click(function() {
                if (me.$image.text() === '+') {
                    as.shell.choosePictures(function(images) {
                        log(images);
                        if (_.isString(images)) {
                            images = images.split(';');
                            images = me.deduplicate(images);
                            if (images.length > 0) {
                                me.setValue(images[0]);
                            }

                            var leaveImages = [];
                            for (var i = 1; i < images.length; ++i) {
                                leaveImages.push(images[i]);
                            }
                            if (leaveImages.length) {
                                me.model.parent.setBackImage(me.model.index, leaveImages);
                            }
                        }
                    }, (me.model.valueIndex === 0 ? 'mainImg' : ''));
                }
            });

            this.$arrow.css('visibility', 'hidden');
        },

        getReminderText: function() {
            var reminders = this.model.field.get('reminders');
            if (_.isArray(reminders) && reminders.length > 0) {
                return reminders[0].text;
            } else {
                return '';
            }
        },

        renderPreview: function() {
            var me = this;
            this.$remove = $('<div class="remove-icon">').attr('title', '删除').click(function() {
                me.reset();
            });

            var config = getConfig(me.model.field, me.model.valueIndex);
            this.$reminder = $('<div class="image-reminder">').html(this.getReminderText());
            var width = this.calcWidth(config);
            this.$major = $('<div class="major ' + (this.model.valueIndex === 0 ? 'first-one' : '') + '">' + (config.required ? '<span class="must">*</span>' : '') + '<span class="text">' + config.text + '</span></div>').css({
                'width': width + 'px',
                'left': (246 - width) / 2 + 'px'
            });

            var value = this.getValue();
            if (value) {
                this.$preview.css('background-image', 'url("' + encodeURI(value) + '")');
                this.$preview.append(this.$remove);
            } else {
                this.$preview.append(this.$major);
                this.$preview.append(this.$reminder);
            }

            this.$preview.hide();
        },

        calcWidth: function(optionConfig) {
            var textWidth = as.util.measureUi($('<span>' + optionConfig.text + '</span>')).width;
            if (optionConfig.required) {
                textWidth += as.util.measureUi($('<span class="must">*</span>')).width;
            }

            log(textWidth, 'px');
            return textWidth;
        },

        active: function() {
            this.$preview.show();
            this.$arrow.css('visibility', 'visible');
            this.$image.addClass('active');
        },

        deactive: function() {
            this.$preview.hide();
            this.$arrow.css('visibility', 'hidden');
            this.$image.removeClass('active');
        },

        onClick: function($el) {
            this.model.field.setActive($el);
        },

        getValue: function() {
            var field = this.model.field;
            var value = field.value();

            if (!_.isArray(value)) {
                return;
            }

            var find = function(index, images) {
                var image = _.find(images, function(image) {
                    return (_.isObject(image) && image.position === index);
                });

                if (_.isObject(image)) {
                    return image.url;
                }
            };

            return find(this.model.valueIndex, value);
        },

        setValue: function(url) {
            var field = this.model.field;
            var image = {
                position: this.model.valueIndex,
                major: this.model.valueIndex === 0,
                url: url
            };

            var value = field.value();
            if (_.isArray(value)) {
                this.tryRemove(value, url, this.model.valueIndex);
                value.push(image);
            } else {
                value = [image];
            }
            field.setValue(value);

            this.$preview.css('background-image', 'url("' + encodeURI(url) + '")');
            this.$preview.append(this.$remove);
            this.$major ? this.$major.detach() : undefined;
            this.$reminder ? this.$reminder.detach() : undefined;

            this.$image.css('background-image', 'url("' + encodeURI(url) + '")').data('url', url);
            this.$image.text('');
        },

        reset: function() {
            var field = this.model.field;
            var value = field.value();
            var url = this.$image.data('url');
            if (_.isArray(value) && url) {
                this.tryRemove(value, url, this.model.valueIndex);
                field.setValue(value);
            }

            this.$preview.css('background-image', '');
            this.$remove.detach();
            this.$major ? this.$preview.append(this.$major) : undefined;
            this.$reminder ? this.$preview.append(this.$reminder) : undefined;

            this.$image.data('url', 0).css('background-image', '');
            this.$image.text('+');
        },

        tryRemove: function(images, url, pos) {
            var findIndex;
            _.find(images, function(image, index) {
                if (image.url === url || image.position === pos) {
                    findIndex = index;
                    return true;
                }
            });

            if (!_.isUndefined(findIndex)) {
                images.splice(findIndex, 1);
            }
        },
    });

    //
    module.exports = View;
});
