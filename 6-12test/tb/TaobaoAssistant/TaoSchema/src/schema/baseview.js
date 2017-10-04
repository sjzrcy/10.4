/**
 * schema级别的抽象动作实现
 */

define(function(require, exports, module) {
    //
    var BaseView = Backbone.View.extend({
        initialize: function() {
            this.model.on('focus', this.onFocus, this);
            this.model.on('disableStatusChanged', this.onDisableStatusChanged, this);

            this.watchInput();
            this.watchClick();
        },

        onFocus: function() {
            as.util.scrollTo(this.el);
        },

        onDisableStatusChanged: function(name, value) {
            if (name === 'disable') {
                if (value === true) {
                    this.$el.hide();
                } else {
                    this.$el.show();
                }
            }
        },

        watchInput: function() {
            var me = this;
            this.$el.delegate('input', 'focus', function() {
                me.model.setActive(me.$el);
            });
        },

        watchClick: function() {
            var me = this;
            this.$el.click(function() {
                me.model.setActive(me.$el);
            });
        }
    });

    //
    module.exports = BaseView;
});
