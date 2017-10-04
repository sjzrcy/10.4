/**
 *
 */

define(function(require, exports, module) {
    //
    var SelectDialog = require('src/schema/ui/props/base/multiselect/dialog/dialog');

    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'prop-dialog-multiselect',

        events: {
            'click .empty-value': function() {
                this.doSelect();
            },

            'click .edit-button': function() {
                this.doSelect();
            }
        },

        initialize: function() {
            this.model.on('valueChanged', this.render, this);
            this.model.on('readonlyStatusChanged', this.render, this);
        },

        render: function() {
            //
            this.$el.empty();

            // 
            var value = this.model.value();
            if (_.isArray(value) && value.length > 0) {
                this.renderValues();
            } else {
                this.renderEmpty();
            }
        },

        renderEmpty: function() {
            var html = '\
			<div class="value-panel empty-value">\
				<div class="tip-text">请选择</div>\
				<div class="tip-icon"></div>\
			</div>';

            this.$el.append($(html));
        },

        renderValues: function() {
            var isReadonly = this.model.isReadonly();
            var $panel = $('<div class="value-panel">');
            if (isReadonly) {
                $panel.css('background-color', '#f6f6f6');
            }

            var $edit = $('<div class="selected-text edit-button">').text('修改');
            $panel.append($edit);
            if (isReadonly) {
                $edit.css('color', '#bcbcbc');
            }

            var values = this.model.value();
            _.each(values, function(option) {
                var $value = $('<div class="selected-text">').data('value', option.value).text(option.text);
                $panel.append($value);
                if (isReadonly) {
                    $value.css('color', '#bcbcbc');
                }
            });

            this.$el.append($panel);
        },

        doSelect: function() {
            if (this.model.isReadonly()) {
                return;
            }

            var me = this;
            var dialog = new SelectDialog({
                model: {
                    title: this.model.get('title'),
                    buttons: [{
                        text: '确定',
                        click: function() {
                            var options = dialog.selectedOptions();
                            dialog.close();
                            me.updateValues(options);
                        }
                    }],

                    options: this.model.get('options'),
                    value: this.model.value(),
                    custom: this.model.get('custom')
                }
            });

            dialog.render();
        },

        updateValues: function(options) {
            this.model.setValue(options);
            this.render();
        }
    });

    module.exports = View;
});
