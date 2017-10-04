/**
 * 辅助枚举选择对话框
 * options[{value: , text:, needContentNumber: boolean }]
 * value([{value: , text:, content: }])
 * maxItems
 */

define(function(require, exports, module) {
    //
    var BaseDialog = require('src/base/common/dialog/dialog');

    //
    var View = BaseDialog.extend({
        initialize: function() {
            BaseDialog.prototype.initialize.apply(this, arguments);
            this.$panel.addClass('prop-material-panel');
        },

        render: function() {
            this.$panel.empty();

            // render
            this.$panel.append(this.renderTip());

            this.$errors = $('<div class="material-errors">');
            this.$panel.append(this.$errors);

            this.$panel.append(this.renderOptions());
            $('body').append(this.$el);
        },

        renderTip: function() {
            var maxItems = this.model.maxItems;
            if (!_.isNumber(maxItems)) {
                maxItems = 5;
            }

            return $('<div class="material-tip">').text('提示：最多勾选' + maxItems + '个，已选材质的含量之和必须为100%');
        },

        updateErrors: function(errors) {
            this.$errors.empty();
            for (var i = 0; i < errors.length; ++i) {
                this.$errors.append(this.renderError(errors[i]));
            }

            if (errors.length === 0) {
                this.$('.material-tip').show();
            } else {
                this.$('.material-tip').hide();
            }
        },

        renderError: function(error) {
            var $error = $('<div class="material-error">');
            $error.append($('<img src="../img/error.png"/>'));
            $error.append($('<span>').text(error));
            return $error;
        },

        renderOptions: function() {
            var $table = $('\
				<table class="material-options-table">\
					<tr>\
						<th>材质名称</th>\
						<th>含量（%）</th>\
						<th>材质名称</th>\
						<th>含量（%）</th>\
					</tr>\
				</table>\
			');

            var options = this.model.options;
            var trCount = parseInt(options.length / 2) + (options.length % 2);
            for (var i = 0; i < trCount; ++i) {
                var $tr = $('<tr>');
                this.renderOption(options[i], $tr);
                if ((i + trCount) < options.length) {
                    this.renderOption(options[i + trCount], $tr);
                } else {
                    $tr.append($('<td></td><td></td>'));
                }

                $table.append($tr);
            }

            return $('<div class="table-wrap">').append($table);
        },

        renderOption: function(option, $tr) {
            var status = this.optionStatus(option);

            var $left = $('<td class="status">');
            $left.append($('<input type="checkbox"/>').prop('checked', status.checked).data('value', option.value).data('text', option.text));
            $left.append($('<span>').text(option.text));

            var $right = $('<td>');
            if (option.needContentNumber) {
                $right.append($('<input type="text"/>').val(status.content));
            } else {
                $right.addClass('no-input').text('--');
            }

            $tr.append($left).append($right);
        },

        optionStatus: function(option) {
            var status = { checked: false, content: '' };
            var value = this.model.value;
            if (_.isArray(value) && value.length > 0) {
                _.find(value, function(item) {
                    if (item.value === option.value) {
                        status.checked = true;
                        status.content = item.content;
                        return true;
                    }
                });
            }

            return status;
        },

        selectedOptions: function() {
            var selectedOptions = [];
            this.$(':checkbox').each(function(i, e) {
                var $checkbox = $(e);
                if ($checkbox.prop('checked')) {
                    var option = {
                        value: $checkbox.data('value'),
                        text: $checkbox.data('text')
                    };

                    var $input = $(':text', $checkbox.parent().next());
                    option.content = _.isUndefined($input.val()) ? '' : as.util.trimedValue($input);

                    selectedOptions.push(option);
                }
            });

            return selectedOptions;
        }
    });

    //
    module.exports = View;
});
