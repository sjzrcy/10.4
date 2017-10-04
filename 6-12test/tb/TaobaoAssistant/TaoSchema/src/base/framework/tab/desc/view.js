/**
 * tab desc 控件
 * 创建控件的ID
 * 对应的schema字段的ID
 */

//
define(function(require, exports, module){
  //
  var PLUGIN_ID = 'desc';
  var FIELD_ID = 'descForPC';
  var Adapter = require('src/base/framework/plugin-adapter');
  var assistant = require('src/base/common/assistant/model');
  var OFFSET_HEIGHT = 37;

  //
  var TabItemView = Backbone.View.extend({
    initialize: function(){
      this.$tab = $('<div class="item">').attr('id', this.model.get('id')).text(this.model.get('title'));
      this.$panel = $('<div class="item">').attr('for', this.model.id).css('height', '0px');
      this.$panel.html('<div class="desc-reminder"></div><div class="plugin-wrapper"><object class="widget" type="tbassistant/npworkbench-plugin" id="' + PLUGIN_ID + '"></object></div>');

      var me = this;
      this.$tab.click(function(){
        me.model.active();
      });

      this.adapter = new Adapter(PLUGIN_ID);
      $('body').bind('pluginReady', function(){
        log('NP - pluginReady >> ' + PLUGIN_ID);
        me.adapter.createPlugin();
        setTimeout(function(){
          me.deactive();
        }, 200);
      });
      
      $(window).resize(function(){
        if(me.$tab.hasClass('active')){
          var height = $(window).height() - OFFSET_HEIGHT;
          me.$panel.css('height', height + 'px');
          me.updatePluginWrapperHeight(height);
          if(me.lastHeight !== height){
            me.lastHeight = height;
            me.trigger('resize');
          }
        }
      });

      this.on('resize', this.onResize, this);

      // 和schema之间的通信
      as.schema.on('schemaChanged', this.onSchemaChanged, this);

      // before save
      as.schema.registerBeforeSaveHandler(function(notifyFinishedCb){
        if(!me.field){
          notifyFinishedCb();
          return;
        }

        // 取值并保存
        me.adapter.get(function(content){
          log(me.field.id, content);
          if(me.field){
            me.field.setValue(content);
          }
          notifyFinishedCb();
        });
      });

      // 自适应发布助手提示条
      assistant.on('updateErrors', this.onAssistantChanged, this);
      assistant.on('clearErrors', this.onAssistantChanged, this);
      assistant.on('heightChanged', this.onAssistantChanged, this);
    },

    active: function(){
      // - 更新remark状态 -
      this.updateReminder(this.field? this.field.get('remark'): '');

      var width = 1010;
      var height = $(window).height() - OFFSET_HEIGHT;
      if(assistant.hasError()){
        height -= assistant.height();
      }

      this.$tab.addClass('active');
      this.$panel.css('width', width + 'px').css('height', height + 'px');

      this.updatePluginWrapperHeight(height);
      this.trigger('resize');
    },

    deactive: function(){
      $('.desc-reminder', this.$panel).hide();
      this.$tab.removeClass('active');
      this.$panel.css('width', '0px').css('height', '0px');
    },

    id: function(){
      return this.model.get('id');
    },

    onResize: function(){
      log('NP - pluginResize >> ' + PLUGIN_ID);
      this.adapter.resizePlugin();
    },

    onSchemaChanged: function(){
      // 解开之前的事件连接
      if(this.field){
        this.field.off('focus', this.onFocus, this);
        this.field.off('hasError', this.onHasError, this);
        this.field.off('noError', this.onNoError, this);
      }

      this.field = as.schema.find(FIELD_ID);
      if(this.field){
        this.$tab.removeClass('has-error');
        this.adapter.set(this.field.value());

        // 事件连接
        this.field.on('focus', this.onFocus, this);
        this.field.on('hasError', this.onHasError, this);
        this.field.on('noError', this.onNoError, this);
      }else{
        this.adapter.set('');
      }
    },

    updateReminder: function(text){
      if(text && _.isString(text)){
        $('.desc-reminder', this.$panel).html(text).show();
      }else{
        $('.desc-reminder', this.$panel).hide();
      }
    },

    getReminderHeight: function(){
      var $reminder = $('.desc-reminder', this.$panel);
      var height = $reminder.height();

      var marginTop = $reminder.css('margin-top');
      height += as.util.numberOfPx(marginTop);

      var marginButtom = $reminder.css('margin-bottom');
      height += as.util.numberOfPx(marginButtom);

      var paddingTop = $reminder.css('padding-top');
      height += as.util.numberOfPx(paddingTop);

      var paddingBottom = $reminder.css('padding-bottom');
      height += as.util.numberOfPx(paddingBottom);

      var borderHeight = $reminder.css('border-width');
      height += (2 * as.util.numberOfPx(borderHeight));

      return height;
    },

    updatePluginWrapperHeight: function(panelHeight){
      if($('.desc-reminder', this.$panel).is(':visible')){
        log('panelHeight>>', panelHeight, 'reminderHeight>>', + this.getReminderHeight());
        $('.plugin-wrapper', this.$panel).css('height', (panelHeight - this.getReminderHeight()) + 'px');
      }else{
        $('.plugin-wrapper', this.$panel).css('height', '100%');
      }
    },

    onFocus: function(){
      this.model.active();
      as.util.twinkle(this.$tab);
    },

    onHasError: function(){
      this.$tab.addClass('has-error');
    },

    onNoError: function(){
      this.$tab.removeClass('has-error');
    },

    onAssistantChanged: function(){
      if(this.$panel.width() > 0){
        this.active();
      }
    }
  });

  //
  module.exports = TabItemView;
});