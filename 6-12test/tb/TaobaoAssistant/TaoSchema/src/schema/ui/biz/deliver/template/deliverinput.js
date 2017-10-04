/**
 * 
 */

define(function(require, exports, module) {
    //
    var base = require('src/schema/ui/base/index');
    var BaseView = require('src/schema/baseview');

    //
    var View = BaseView.extend({
        tagName: 'div',
        className: 'schema',

        initialize: function() {
            // 继承schema行为
            BaseView.prototype.initialize.apply(this, arguments);

            // 禁止标题报错
            this.model.set('forbidTopError', true);

            // 数据准备-替换掉top，增加编辑和刷新入口
            this.top = new base.TopSchemaView({ model: this.model });
            this.input = new base.AsInputView({ model: this.model });
            this.bottom = new base.BottomSchemaView({ model: this.model });

            // 定制
            this.unit = this.model.get('unit');
            this.model.set('unit', undefined);
        },

        render: function() {
            this.$el.empty();

            // 处理失效状态
            if (this.model.isDisable()) {
                this.$el.hide();
            }

            this.top.render();
            this.$el.append(this.top.$el);

            var $wrap = $('<div>').css({ 'width': '140px' });
            this.input.render();
            $wrap.append(this.input.$el);
            if (this.unit) {
                var $unit = $('<div class="deliver-unit">').text(this.unit);
                $wrap.append($unit);
            }
            this.$el.append($wrap.append(this.input.$el));

            this.bottom.render();
            this.$el.append(this.bottom.$el);
        }
    });

    //
    module.exports = View;
});
