/**
 * IN：
 * inputs layout
 * 
 * OUT:
 * signal: fill({x-id: x-value})
 */

define(function(require, exports, module) {
    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'sku-inputs',

        events: {
            'focus input': function() {
                var $input = $(event.srcElement);
                var defaultText = $input.attr('default-text');
                var value = $input.val();
                if (defaultText === value && $input.hasClass('empty-item')) {
                    $input.removeClass('empty-item').val('');
                }
            },

            'blur input': function() {
                var $input = $(event.srcElement);
                var value = as.util.trimedValue($input);
                if (value === '') {
                    var defaultText = $input.attr('default-text');
                    $input.addClass('empty-item').val(defaultText);
                }
            },

            'click .inputs-confirm': function() {
                var fill = {};
                this.$('input').each(function() {
                    var $input = $(this);
                    if (!$input.hasClass('empty-item')) {
                        var id = $input.attr('id');
                        fill[id] = $input.val();

                        var defaultText = $input.attr('default-text');
                        $input.addClass('empty-item').val(defaultText);
                    }
                });

                if (!_.isEmpty(fill)) { // 向外抛出批量填充信号
                    this.trigger('fill', fill);
                }
            }
        },

        initialize: function() {
            var inputsLayout = this.model;
            var children = inputsLayout.children();
            if (_.isArray(children) && children.length > 0) {
                this.inputs = children;
            }
        },

        render: function() {
            if (_.isUndefined(this.inputs)) {
                return;
            }

            this.$el.append($('<span>批量填充：</span>'));

            var me = this;
            _.each(this.inputs, function(input) {
                var id = input.id;
                var title = input.get('title');
                var $input = $('<input class="input-item empty-item">').attr('id', id).attr('default-text', title).val(title);
                me.$el.append($input);
            });

            this.$el.append($('<span class="inputs-confirm">确定</span>'));
        },

        show: function() {
            this.$el.show();
        },

        hide: function() {
            this.$el.hide();
        },
    });

    //
    module.exports = View;
});
