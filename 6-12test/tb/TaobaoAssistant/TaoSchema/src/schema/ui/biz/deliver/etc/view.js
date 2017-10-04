/**
 * 
 */

define(function(require, exports, module){
    //
    var etc = isInQN()? require('src/schema/ui/biz/deliver/etc/etc-qn'): require('src/schema/ui/biz/deliver/etc/etc');
    var Reminder = require('src/schema/ui/base/reminder');

    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'etc',

        events: {
            'click .field-option :checkbox': function(){
                var $checkbox = $(event.srcElement);
                if($checkbox.prop('checked')){
                    as.util.addOptionValue(this.model.optionField, this.option.value);
                    if(this.etc.isReady()){
                        this.model.field.setActionStatus('disable', false);
                        this.etc.$el.show();

                        if(typeof this.etc.getHeight === 'function'){
                            this.etc.getHeight();
                        }
                    }
                }else{
                    as.util.removeOptionValue(this.model.optionField, this.option.value);
                    this.model.field.setActionStatus('disable', true);
                    this.etc.$el.hide();
                }
            }
        },

        initialize: function(){
            etc.setField(this.model.field);
            this.model.field.on('focus', this.onFocus, this);
            this.model.field.on('hasError', this.onHasError, this);
            this.model.field.on('noError', this.onNoError, this);

            var optionValue = this.model.field.get('for');
            var optionText = this.model.optionField.findOptionText(optionValue);
            if(!optionText){ // 如果查不到，则默认使用自己的标题
                optionText = this.model.field.get('title');
            }
            this.option = {'value': optionValue, 'text': optionText};
            this.canApply = this.model.field.get('canApply');// 是否能开通电子凭证业务
            this.apply = this.model.field.get('apply');// 是否已开通电子凭证业务

            // 取reminder，并做适当修正
            var reminders = this.model.field.get('reminders');
            this.reminders = [];
            var me = this;
            _.each(reminders, function(reminder, index, list){
                var temp = _.extend({}, reminder);
                temp.align = 'left';
                if(temp.mode !== 'hover' && temp.mode !== 'normal'){
                    temp.mode = 'hover';    
                }
                me.reminders.push(temp);
            });
        },

        render: function(){
            var isChecked = false;
            if(this.apply){
                isChecked = as.util.isChecked(this.model.optionField, this.option.value);
            }
            
            // option-box
            var $optionBox = $('<div class="field-option-box clearfix">');
            this.$el.append($optionBox);

            // option
            var $option = $('<div class="field-option float-left">');
            var $checkbox = $('<input type="checkbox">').prop('checked', isChecked).prop('disabled', this.model.optionField.isReadonly());
            var $text = $('<span>').text(this.option.text);
            this.$text = $text;
            $option.append($checkbox).append($text);
            $optionBox.append($option);

            // reminders
            var me = this;
            _.each(this.reminders, function(reminder){
                var reminderView = new Reminder({model: reminder});
                reminderView.render();
                reminderView.$el.addClass('float-left');
                
                // 修正
                if(reminder.mode === 'hover'){
                    reminderView.$el.css({'top': '2px', 'margin-left': '3px'});
                }else{
                    reminderView.$el.css({'top': '4px', 'margin-left': '3px', 'height': '16px'});
                }

                $optionBox.append(reminderView.$el);
            });

            if(!this.apply){// 若未开通，则禁用使用，但提供强制刷新入口
                $checkbox.prop('disabled', true);
                if(this.canApply){ // 能开通时才提供入口刷新
                    $('<div class="float-left apply-etc">').text('我已开通').click(function(){
                        as.entity.refreshSchema();
                    }).appendTo($optionBox);
                }else{
                    $('<div class="float-left apply-etc">').css({
                        'cursor': 'auto',
                        'color': '#ff9900'
                    }).text('该类目不支持电子凭证业务').appendTo($optionBox);
                }
            }else{
                // etc 
                this.$el.append(etc.$el);
                etc.render();

                // 
                if(isChecked){
                    etc.$el.show();

                    // 显示时，更新高度
                    if(typeof etc.getHeight === 'function'){
                        etc.getHeight();
                    }
                }else{
                    etc.$el.hide();
                }

                // 便于操作
                this.etc = etc;
            }
        },

        onFocus: function(){
            as.util.scrollTo(this.$text[0]);
            as.util.twinkle(this.$text);
        },

        onHasError: function(){
            this.$text.addClass('has-error');
        },

        onNoError: function(){
            this.$text.removeClass('has-error');
        }
    });

    //
    module.exports = View;
});