define(function(require, exports, module){
  var Reminder = require('src/schema/ui/base/reminder');

  module.exports = Backbone.View.extend({
    tagName: 'form',
    className: 'asradio',

    events: {
      "click :radio": function(){
        var value;
        this.$(':radio').each(function(){
          var $radio = $(this);
          if($radio.prop('checked')){
            value = $radio.data('value');
            return false;
          }
        });
        this.model.setValue(value);
      }
    },

    initialize: function(){
      this.$el.css(this.model.get('css')? this.model.get('css'): {});
      this.model.on('valueUpdated', this.render, this);
      this.model.on('readonlyStatusChanged', this.render, this);
    },

    render: function(){
      // 清空
      this.$el.empty();

      //
      var me = this;
      var id = this.model.get('id');
      var value = this.model.value();
      var isReadonly = this.model.isReadonly();

      var options = this.model.get('options');
      _.each(options, function(option){
        var $option = $('<div class="option-v clearfix">');
        var $radio = $('<input type="radio">').addClass('radio').data('value', option.value).attr('name', id);
        $radio.prop('checked', (value === option.value)).prop('disabled', isReadonly);
        var $text = $('<label class="text">').text(option.text);
        $option.append($radio).append($text);
        me.$el.append($option);

        var reminders = option.reminder;
        if(!_.isArray(reminders) && _.isObject(reminders)){
          reminders = [reminders];
        }
        if(_.isArray(reminders)){
          _.each(reminders, function(reminder){
            var view = new Reminder({model: reminder});
            view.render();
            view.$el.removeClass('clearfix').addClass('float-left');
            $option.append(view.$el);
          });
        }
      });
    }
  });
  //
});