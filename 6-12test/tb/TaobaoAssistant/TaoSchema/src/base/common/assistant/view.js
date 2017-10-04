/**
 * 发布助手
 * 事件：
 * update 信息重置
 * itemRemoved 移除某错误 （id）
 */

define(function(require, exports, module) {
    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'assistant',

        events: {
            'click .error-panel .error-item': function() {
                var $item = $(event.srcElement);
                var id = $item.attr('for');
                var item = as.schema.find(id);
                if (item) {
                    // 如果不是插件，就尝试做一个切换到信息tab的动作
                    if (!this.isPluginId(id)) {
                        as.schema.trigger('change2ItemTab');
                    }
                    item.focus();
                }
            }
        },

        isPluginId: function(id) {
            var ids = ['description', 'wireless'];
            return (ids.indexOf(id) !== -1);
        },

        initialize: function() {
            this.model.on('itemRemoved', this.onItemRemoved, this);
            this.model.on('updateErrors', this.onUpdateErrors, this);
            this.model.on('clearErrors', this.onClearErrors, this);
        },

        render: function() {
            // clear
            this.$el.html('');

            // check
            if (!this.model.hasError()) {
                error('没有错误，应该渲染成功提示！');
                return;
            }

            // render
            var $tip = $('<div class="error-tip float-left">').text('错误项：');
            this.$el.append($tip);

            var $panel = $('<div class="error-panel float-left clearfix">');
            this.$el.append($panel);

            var items = this.model.get('items');
            _.each(items, function(item) {
                var $item = $('<div class="error-item float-left">').attr('for', item.id).text(item.get('title'));
                $panel.append($item);
            });
        },

        onItemRemoved: function(id) {
            this.$('[for=' + JID(id) + ']').remove();
            // 如果所有错误都已经处理完毕，则错误提示消失
            if (this.$('.error-item').length === 0) {
                this.$el.detach();
                this.model.setHeight(0);
            } else {
                this.model.setHeight(this.$el.height());
            }
        },

        onUpdateErrors: function() {
            this.render();
            $('body').append(this.$el);
            this.model.setHeight(this.$el.height());
        },

        onClearErrors: function() {
            this.$el.detach();
            this.model.setHeight(0);
        }
    });

    // 单实例
    var model = require('src/base/common/assistant/model');
    module.exports = new View({ 'model': model });
});
