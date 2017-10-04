/**
 * 
 */

define(function(require, exports, module){
  //
  var base = require('src/schema/ui/base/index');
  var Reminder = require('src/schema/ui/base/reminder');

  //
  var View = Backbone.View.extend({
    tagName: 'div',
    className: 'schema aftersale',

    events: {
      'click input:checkbox': function(){
        var $checkbox = $(event.srcElement);
        var $option = $checkbox.parent();

        var id = $option.attr('for');
        var option = _.find(this.options, function(option){
          return (option.id === id);
        });

        var field = option.field;
        var isCheckd = $checkbox.prop('checked');
        field.setValue(isCheckd? option.checked: undefined);
      }
    },

    initialize: function(){
      // options
      this.options = [];

      // 数据转换
      var me = this;
      var children = this.model.children();
      _.each(children, function(child){
        // 占位模型
        if(!child.get('render')){
          return;
        }

        // link
        child.on('disableStatusChanged', function(name, value){
          me.setOptionDisableState(child.id, value);
        });
        child.on('readonlyStatusChanged', function(name ,value){
          me.setOptionReadonlyState(child.id, value);
        });
        child.on('valueUpdated', me.render, me);
        child.on('focus', function(){
          me.onFocus(child.id);
        }, me);

        // build
        var option = me.makeOption(child);
        if(option){
          me.options.push(option);
        }
      });

      // 标题
      this.model.set('title', '售后服务');
      this.top = new base.TopSchemaView({model: this.model});
    },

    onFocus: function(id){
      // 定位
      var $el = this.$('[for="' + id + '"]');
      if($el.length){
        as.util.scrollTo($el[0]);
        as.util.twinkle($el);
      }
    },

    render: function(){
      this.$el.empty();

      this.top.render();
      this.$el.append(this.top.$el);

      // render options
      var $panel = $('<div class="asmultiselect">');
      this.$el.append($panel);

      _.each(this.options, function(option){
        if(option.disable === true){
          return;
        }

        var $option = $('<span class="option">').attr('for', option.id);
        $option.click(function(){
          option.field.setActive($option);
        });

        var $checkbox = $('<input type="checkbox">');
        $checkbox.prop('checked', _.isEqual(option.field.value(), option.checked)).prop('disabled', option.readonly);
        
        var $text = $('<span class="text">').text(option.title);
        if(option.must){
          $text.prepend($('<span class="must">').text('*'));
        }
        if(option.readonly){
          $text.css('color', '#666666');
        }

        $option.append($checkbox).append($text);
        if(option.reminder){
          var reminder = new Reminder({model: option.reminder});
          reminder.render();
          $option.append(reminder.$el.css('display', 'inline-block').css('vertical-align','bottom'));
        }

        $panel.append($option);
      });
    },

    makeOption: function(field){
      var option = {
        field: field,
        id: field.id,
        title: field.get('title'),
        must: field.isMust(),
        disable: field.get('initActionStatus').disable? true: false,
        readonly: field.get('initActionStatus').readonly? true: false,
        checked: [field.get('options')[0].value],
        reminder: this.makeReminder(field)
      };

      return option;
    },

    findOption: function(id){
      return (_.find(this.options, function(option){
        return (option.id === id);
      }));
    },

    setOptionDisableState: function(id, value){
      var option = this.findOption(id);
      if(option){
        option.disable = value;
        this.render();
      }
    },

    setOptionReadonlyState: function(id, value){
      var option = this.findOption(id);
      if(option){
        option.readonly = value;
        this.render();
      }
    },

    makeReminder: function(field){
      var reminder;
      var options = field.get('options');
      if(_.isArray(options) && _.isObject(options[0])){
        var option = options[0];
        // 取option的text为reminder
        if(_.isString(option.text) && option.text.length > 4){
          reminder = {mode: 'hover', level: 'normal', align: 'left', text: option.text};
        }

        // 合并选项内的reminder(单个OBJECT)
        if(typeof option.reminder === 'object'){
          var optionReminder = option.reminder;
          if(optionReminder.text){
            if(reminder){
              reminder.text += ('；' + optionReminder.text);
            }else{
              reminder = {mode: 'hover', level: 'normal', align: 'left', text: optionReminder.text};
            }
          }
        }
      }

      // 合并组件内的reminder
      _.each(field.get('reminders'), function(fieldReminder){
        if(fieldReminder.text){
          if(reminder){
            reminder.text += ('；' + fieldReminder.text);
          }else{
            reminder = {mode: 'hover', level: 'normal', align: 'left', text: fieldReminder.text};
          }
        }
      });

      return reminder;
    }
  });

  //
  module.exports = View;
});