/**
 * 
 */

define(function(require, exports, module){
  //
  var Reminder = require('src/schema/ui/base/reminder');
  
  //
  var View = Backbone.View.extend({
    tagName: 'div',
    className: 'asmultiselect-sku ',

    events: {
      "click .option :checkbox": function(){
        // 备注动态显隐
        var $checkbox = $(event.srcElement);
        var $remark = $checkbox.siblings('.remark');
        if($remark.length){
          $remark.css('visibility', $checkbox.prop('checked')? 'visible': 'hidden');
        }

        this.model.setValue(this.getSelectedOptions());
      },

      "blur .option .remark": function(){
        var $remark = $(event.srcElement);
        var remark = $remark.val();
        var last = $remark.data('last');
        if(!this.lessThanRemarkMaxLength(remark)){
          var max = this.remarkMaxLength();
          as.util.showErrorTip('备注长度不能超过' + max + '，(' + max/2 + '个汉字)');
          $remark.val(last);
          return;
        }

        if(remark !== last){
          $remark.data('last', remark);
          var value = $remark.siblings(':checkbox').data('value');
          this.updateRemark(value, $remark.val());
        }
      },

      "click .custom-option :checkbox": function(){
        var $checkbox = $(event.srcElement);
        if($checkbox.prop('checked')){
          if(this.canAddCustomOption()){
            this.$('.custom-options').append(this.renderEmptyCustomOption());
          }

          // 输入框自动获取焦点
          $checkbox.siblings(':text').focus();
        }else{
          var hasValidValue = !!$checkbox.siblings(':text').val();
          $checkbox.parent().remove();
          if(!this.hasEmptyCustomOption() && this.canAddCustomOption()){
            this.$('.custom-options').append(this.renderEmptyCustomOption());
          }

          // 删除合法值时更新
          if(hasValidValue){
            this.model.setValue(this.getSelectedOptions()); 
          }
        }
      },

      "focus .custom-option :text": function(){
        var $text = $(event.srcElement);
        var $checkbox = $text.siblings(':checkbox');
        if(!$checkbox.prop('checked')){
          $checkbox.prop('checked', true);
          if(this.canAddCustomOption()){
            this.$('.custom-options').append(this.renderEmptyCustomOption());
          }
        }
      },

      "blur .custom-option :text": function(){
        var $text = $(event.srcElement);
        var text = $text.val();
        var last = $text.data('last');
        if(!this.lessThanCustomMaxLength(text)){
          $text.val(last);
          var max = this.customMaxLength();
          as.util.showErrorTip('自定义长度不能超过' + max + '，(' + max/2 + '个汉字)');
          return;
        }

        if(text !== last){
          $text.data('last', text);

          // 文本变化时更新
          this.model.setValue(this.getSelectedOptions());
        }
      },
    },

    initialize: function(){
      this.model.on('valueUpdated', this.render, this);
      this.model.on('readonlyStatusChanged', this.render, this);
      this.MIN = 0;
    },

    getSelectedOptions: function(){
      var options = [];
      options = options.concat(this.getNormalCheckedOptions());
      options = options.concat(this.getCustomCheckedOptions());
      return options;
    },

    getNormalCheckedOptions: function(){
      var options = [];
      this.$('.options .option :checkbox').each(function(){
        var option = {};
        var $checkbox = $(this);
        if($checkbox.prop('checked')){
          // text, value
          option.value = $checkbox.data('value');
          option.text = $checkbox.siblings('.text').text();

          // remark
          var $remark = $checkbox.siblings('.remark');
          if($remark.length && $remark.val()){
            option.remark = $remark.val();
          }

          options.push(option);
        }
      });

      return options;
    },

    getCustomCheckedOptions: function(){
      var options = [];
      this.$('.custom-options .custom-option :checkbox').each(function(){
        var $checkbox = $(this);
        if($checkbox.prop('checked')){
          var text = $checkbox.siblings(':text').val();
          if(text){
            var option = {text: text};
            option.value = $checkbox.data('value');
            options.push(option);
          }
        }
      });

      return options;
    },

    updateRemark: function(value, remark){
      var values = this.model.value();
      if(_.isArray(values) && values.length){
        _.find(values, function(option){
          if(option.value === value){
            option.remark = remark;
            return true;
          }
        });
      }
    },

    // 是否支持自定义
    isSupportCustom: function(){
      return !!this.model.get('custom');
    },

    // 是否支持备注
    isSupportRemark: function(){
      return !!this.model.get('remark');
    },

    // 能否继续添加自定义选项
    canAddCustomOption: function(count){
      var canAddMore = true;
      var custom = this.model.get('custom');
      if(typeof custom === 'object' && custom.maxSize > 0){
        canAddMore = ((count? count: this.customOptionCount()) < custom.maxSize);
      }

      return canAddMore;
    },

    hasEmptyCustomOption: function(){
      var hasEmpty = false;
      this.$('.custom-options .custom-option :checkbox').each(function(i, e){
        if(!$(this).prop('checked')){
          hasEmpty = true;
          return false;
        }
      });

      return hasEmpty;
    },

    // 当前的自定义项数量
    customOptionCount: function(){
      return this.$('.custom-option').length;
    },

    // 是否超过自定义最大长度
    lessThanCustomMaxLength: function(text){
      var isLess = true;
      var custom = this.model.get('custom');
      if(typeof custom === 'object' && custom.maxLength > 0){
        isLess = as.util.bytes(text) <= custom.maxLength;
      }

      return isLess;
    },

    customMaxLength: function(){
      var custom = this.model.get('custom');
      if(typeof custom === 'object' && custom.maxLength > 0){
        return custom.maxLength;
      }
    },

    // 是否超过备注最大长度
    lessThanRemarkMaxLength: function(text){
      var isLess = true;
      var remark = this.model.get('remark');
      if(typeof remark === 'object' && remark.maxLength > 0){
        isLess = as.util.bytes(text) <= remark.maxLength;
      }

      return isLess;
    },

    remarkMaxLength: function(){
      var remark = this.model.get('remark');
      if(typeof remark === 'object' && remark.maxLength > 0){
        return remark.maxLength;
      }
    },

    remarkTip: function(){
      var tip = '备注';
      var remark = this.model.get('remark');
      if(typeof remark === 'object' && remark.tip && typeof remark.tip === 'string'){
        tip = remark.tip;
      }

      return tip;
    },

    isChecked: function(option){
      var isChecked = false;
      var value = this.model.value();
      if(_.isArray(value)){
        _.find(value, function(item){
          if(item.value === option.value){
            isChecked = true;
            return true;
          }
        });
      }

      return isChecked;
    },

    getRemarkText: function(option){
      var valueOption;
      var value = this.model.value();
      if(_.isArray(value)){
        _.find(value, function(item){
          if(item.value === option.value){
            valueOption = item;
            return true;
          }
        });
      }

      var text = '';
      if(typeof valueOption === 'object' && valueOption.remark !== undefined){
        text = valueOption.remark;
      }

      return text;
    },

    isReadonly: function(){
      return this.model.isReadonly();
    },

    getCustomOptions: function(){
      var options = [];
      var value = this.model.value();
      if(_.isArray(value)){
        _.each(value, function(option){
          if(typeof option === 'object' && Number(option.value) < 0){
            options.push(option);
          }
        });
      }

      return options;
    },

    renderOneOption: function(option){
      var $option = $('<span class="option">');
      var isChecked = this.isChecked(option);
      var $checkbox = $('<input type="checkbox">')
                .data('value', option.value)
                .prop('checked', isChecked)
                .prop('disabled', this.isReadonly());
      var $text = $('<span class="text">').text(option.text);
      $option.append($checkbox).append($text);

      // reminder
      var reminders = option.reminder;
      if(!_.isArray(reminders) && _.isObject(reminders)){
        reminders = [reminders];
      }
      if(_.isArray(reminders)){
        _.each(reminders, function(reminder){
          var view = new Reminder({model: reminder});
          view.render();
          view.$el.css({
            "display": "inline-block",
            "vertical-align": "bottom"
          });
          $option.append(view.$el);
        });
      }

      // remark
      if(this.isSupportRemark()){
        var $remark = $('<input class="remark">')
          .attr('placeholder', this.remarkTip())
          .css('visibility', isChecked? 'visible': 'hidden')
          .val(this.getRemarkText(option));

        // 如果有备注就固定长度为154像素
        $option.css('min-width', '154px').append($remark);
      }

      return $option;
    },

    renderOptions: function(){
      var $options = $('<div class="options">');
      var options = this.model.get('options');
      if(_.isArray(options)){
        var me = this;
        _.each(options, function(option){
          if(_.isObject(option)){
            $options.append(me.renderOneOption(option));
          }
        });
      }

      return $options;
    },

    renderCustomTip: function(){
      return $('<div class="custom-tip">').text('自定义属性值');
    },

    renderOneCustomOption: function(option){
      var $option = $('<span class="custom-option">');
      var isChecked = this.isChecked(option);
      var $checkbox = $('<input type="checkbox">')
                .data('value', option.value)
                .prop('checked', isChecked)
                .prop('disabled', this.isReadonly());
      var $text = $('<input type="text">').attr('placeholder', '自定义').data('last', option.text).val(option.text);
      $option.append($checkbox).append($text);

      return $option;
    },

    renderEmptyCustomOption: function(){
      this.MIN -= 1;
      var option = {
        value: this.MIN,
        text: ''
      };

      return this.renderOneCustomOption(option);
    },

    renderCustomOptions: function(){
      var $options = $('<div class="custom-options">');
      $options.append(this.renderCustomTip());

      var customCount = 0;
      var options = this.getCustomOptions();
      if(_.isArray(options)){
        var me = this;
        _.each(options, function(option){
          if(_.isObject(option)){
            customCount += 1;
            $options.append(me.renderOneCustomOption(option));
          }
        });
      }

      if(this.canAddCustomOption(customCount)){
        $options.append(me.renderEmptyCustomOption());
      }

      return $options;
    },

    render: function(){
      // 清空
      this.$el.empty();

      // 渲染标准选项
      this.$el.append(this.renderOptions());

      // 渲染自定义选项
      if(this.isSupportCustom()){
        this.$el.append(this.renderCustomOptions());
      }
    }
  });

  //
  module.exports = View;
});