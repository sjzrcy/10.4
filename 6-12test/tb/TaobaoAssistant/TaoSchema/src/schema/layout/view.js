/**
 * schema 布局-view
 */

define(function(require, exports, module) {
    //
    var viewService = require('src/schema/service/viewservice');

    //
    var subWidth = function(column, width) {
        if (width <= 0 || column <= 0 || column > width) {
            return '100%';
        }

        var subWidth = column * 100 / width;
        subWidth = Math.floor(subWidth);
        return (subWidth + '%');
    };

    //
    var LayoutView = Backbone.View.extend({
        tagName: "div",
        className: "layout",

        initialize: function() {

        },

        doMode: function() {
            var mode = this.model.get('mode');
            if (mode === 'sub') {
                this.$el.addClass('schema-sub-grey');
            }
        },

        doCss: function() {
            // 设置样式
            this.$el.css(this.model.get('css'));

            // 适配样式
            // padding-left
            var paddingLeft = this.$el.css('padding-left');
            if (paddingLeft) {
                var width = this.$el.css('width');
                this.$el.css('width', 'calc(' + width + ' - ' + paddingLeft + ')');
            }
        },

        render: function() {
            // reset
            this.$el.empty();

            // render
            this.doMode();

            // 顶层的宽度为100%
            if (this.model.isTop()) {
                this.$el.css('width', '100%');
            }

            // 如果是一个特定业务组件
            var biz = this.model.get('biz');
            if (biz && !this.model.ready) {
                var BizView = viewService.get(biz);
                if (BizView) {
                    try {
                        var bizView = new BizView({ 'model': this.model });
                        bizView.$el.css('width', '100%');
                        this.setElement(bizView.el);
                        bizView.render();
                    } catch (e) {
                        error('业务组件 >>', biz, '数据异常！');
                        error('异常描述：', e.toString());
                    }
                } else {
                    error('未知业务组件类型 >> ' + biz);
                }
                return;
            }

            // 处理css
            this.doCss();

            // 子ui单元，不能设置自己的宽度，只能被上层设置
            var isHorizontal = (this.model.get('style') === 'horizontal');
            if (isHorizontal) {
                this.$el.addClass('clearfix');
            }

            var me = this;
            var width = this.model.get('width');
            _.each(this.model.children(), function(item) {
                var type = item.get('type');
                var subView;
                if (type === 'layout') {
                    subView = new LayoutView({ model: item });
                } else {
                    if (item.get('render')) { // render标记为真
                        var ItemView = viewService.get(type);
                        if (ItemView) {
                            subView = new ItemView({ model: item });
                        } else {
                            error('schema: 未知基础组件类型 >> ', type, ', id >> ', item.id);
                        }
                    }
                }

                if (subView) {
                    // 只设置通用单元的宽度，不关注业务组件
                    if (!subView.model.get('biz')) {
                        subView.$el.css('width', subWidth(item.get('column'), width));
                        if (isHorizontal) {
                            subView.$el.addClass('float-left');
                        }
                    }

                    // 执行渲染
                    subView.render();
                    me.$el.append(subView.$el);
                }
            });
        }
    });

    //
    module.exports = LayoutView;
});
