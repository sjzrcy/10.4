define(function(require, exports, module){
  /**/

  var BaseView = require('src/schema/baseview');
  module.exports = BaseView.extend({
    tagName: 'div',
    className: 'schema prop spuconfirm',
    events: {
      'click :checkbox': function(){
        var $checkbox = $(event.srcElement);
        this.updateValue($checkbox.prop('checked'));
      }
    },

    initialize: function(){
      BaseView.prototype.initialize.apply(this, arguments);
      this.option = (function(options){
        if(_.isArray(options) && options.length > 0){
          return options[0];
        }else{
          return {};
        }
      })(this.model.get('options'));
    },

    render: function(){
      this.$el.empty();

      var $check = $('<input type="checkbox">').prop('checked', this.isChecked());
      this.$el.append($check);

      var $text = $('<span>').html(this.option.text);
      this.$el.append($text);
    },

    isChecked: function(){
      var value = this.model.value();
      return (_.isArray(value) && value.length === 1 && value[0] === this.option.value);
    },

    updateValue: function(isChecked){
      if(isChecked){
        this.model.setValue([this.option.value]);
      }else{
        this.model.setValue(undefined);
      }
    }
  });
});