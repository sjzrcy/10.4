define(function(require, exports, module) {
    /**/

    var BaseView = require('src/schema/baseview');
    var CustomPropsDialog = require('src/schema/ui/props/type/customprops/dialog');
    module.exports = BaseView.extend({
        tagName: 'div',
        className: 'schema prop custom',
        events: {
            'click .plus-icon, .add, .edit': function() {
                this.doSaveProps();
            }
        },

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.on('stateUpdated', this.render, this);
        },

        render: function() {
            this.$el.empty();

            //组件标题栏
            var $titleBar = $('<div class="titleBar"></div>');
            $titleBar.append($('<span class="title"></span>').text(this.model.get('title')));
            var $edit = $('<span class="edit"><a href="#">编辑</a></span>');
            $titleBar.append($edit);
            this.$el.append($titleBar);

            //组件添加栏
            var $addLine = $('<div class="addLine"></div>');
            var $add = $('<span class="plus-icon">+</span><span class="add">添加</span>');
            $addLine.append($add);
            this.$el.append($addLine);

            var customprops = this.model.get('value');
            var me = this;
            if (!_.isArray(customprops) || customprops.length === 0) {
                $addLine.css('display', 'block');
                $edit.css('display', 'none');
            } else {
                $addLine.css('display', 'none');
                $edit.css('display', 'block');
                // 表格渲染
                _.each(customprops, function(pair) {
                    me.$el.append(me.renderOnePair(pair));
                });
            }

            this.$el.show();
        },

        renderOnePair: function(pair) {
            var tmp = $('<div class="pair"><span class="label"></span><span class="text"></span></div>');
            $('.label',tmp).text(pair.name);
            $('.text',tmp).text(pair.value);
            return tmp;
        },

        doSaveProps: function() {
            var me = this;
            var dialog = new CustomPropsDialog({
                'model': {
                    field: this.model,
                    title: '自定义商品属性',
                    offset: {
                        left: 258,
                        top: 58
                    },
                    buttons: [{
                        text: '确定',
                        click: function() {
                            var customprops = dialog.getCustomProps();
                            me.model.setValue(customprops);
                            me.render();
                            dialog.close();
                        }
                    }],
                    beforeCloseCb: function() {
                        var customprops = dialog.getCustomProps();
                        me.model.setValue(customprops);
                        me.render();
                    }
                }
            });

            dialog.render();
            dialog.$el.appendTo($('body'));
        }
    });
});