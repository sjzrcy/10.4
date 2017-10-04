/**
 * IN: field,optionField
 */

define(function(require, exports, module){
  //
  var DeliverTemplateView = require('src/schema/ui/biz/deliver/template/template');
  var DeliverInput = require('src/schema/ui/biz/deliver/template/deliverinput');
  var deliver = require('src/schema/async/deliver');

  //
  var View = Backbone.View.extend({
    tagName: 'div',
    className: 'deliverTemplate',

    events: {
      'click .field-option :checkbox': function(){
        var $checkbox = $(event.srcElement);
        if($checkbox.prop('checked')){
          as.util.addOptionValue(this.model.optionField, this.option.value);
          this.template.$el.show();
        }else{
          as.util.removeOptionValue(this.model.optionField, this.option.value);
          this.template.$el.hide();
        }
      }
    },

    initialize: function(){
      // option
      var optionValue = this.model.field.get('for');
      var optionText = this.model.optionField.findOptionText(optionValue);
      this.option = {'value': optionValue, 'text': optionText};

      // valueChanged
      this.model.field.on('valueChanged', this.onTemplateChanged, this);
    },

    render: function(){
      var isChecked = as.util.isChecked(this.model.optionField, this.option.value);
      
      // option
      var $option = $('<div class="field-option">');
      var $checkbox = $('<input type="checkbox">').prop('checked', isChecked).prop('disabled', this.model.optionField.isReadonly());
      var $text = $('<span>').text(this.option.text);
      $option.append($checkbox).append($text);
      this.$el.append($option);

      // deliverTemplate 
      var template = new DeliverTemplateView({'model': this.model.field});
      template.render();
      this.$el.append(template.$el);

      // 
      if(isChecked){
        template.$el.show();
      }else{
        template.$el.hide();
      }

      // 便于操作
      this.template = template;

      // weight
      var weight = this.model.weight;
      if(weight && isChecked){
        this.$weight = this.renderDeliverWeight(weight);
        this.$el.append(this.$weight);
      }

      // volumn
      var volumn = this.model.volumn;
      if(volumn && isChecked){
        this.$volumn = this.renderDeliverVolumn(volumn);
        this.$el.append(this.$volumn);
      }
    },

    renderDeliverWeight: function(field){
      return this.renderDeliverInput(field);
    },

    renderDeliverVolumn: function(field){
      return this.renderDeliverInput(field);
    },

    renderDeliverInput: function(field){
      var input = new DeliverInput({model: field});
      input.render();
      return input.$el;
    },

    onTemplateChanged: function(){
      var templateId = this.model.field.value();
      if(!templateId){
        this.updateStatus(true, true);
        return;
      }

      var me = this;
      deliver.getStatus(templateId, function(status){
        if(status.result && _.isObject(status.data)){
          me.updateStatus(
            me.getBool(status.data['deliveryParams.deliverWeight'], 'disable'), 
            me.getBool(status.data['deliveryParams.deliverVolumn'], 'disable')
          );
        }else{// 接口异常时，都显示出来
          me.updateStatus(false, false);
        }
      });
    },

    updateStatus: function(weight, volumn){
      if(this.model.weight){
        this.model.weight.setActionStatus('disable', weight); 
      }

      if(this.model.volumn){
        this.model.volumn.setActionStatus('disable', volumn);
      }
    },

    getBool: function(obj, key){
      if(_.isObject(obj)){
        return !!obj[key];
      }else{
        return false;
      }
    }
  });

  //
  module.exports = View;
});