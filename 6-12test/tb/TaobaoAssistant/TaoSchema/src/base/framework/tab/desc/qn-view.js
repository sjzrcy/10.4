/**
 * tab desc 控件
 * 创建控件的ID
 * 对应的schema字段的ID
 */

//
define(function(require, exports, module){
  //
  var FIELD_ID = 'descForPC';
  var HtmlEditor = require('src/base/editor/htmlEditor');
  var assistant = require('src/base/common/assistant/model');
  var bind = require('src/base/framework/bind');
  var editor = new HtmlEditor();

  var isActived = false;
  var lastNpHeight = 0;
  bind('np_hide', function(){
    if(isActived){
      var $np = $('#npEditor');
      lastNpHeight = $np.height();
      $np.height(0);
    }
  });
  bind('np_show', function(){
    if(isActived){
      $('#npEditor').height(lastNpHeight);
      editor.refresh();
    }
  });

  // 对接插入图片
  editor.onContextMenuInsertImage = function(cb){
    as.shell.choosePictures(function(imgs){
      if(typeof imgs === 'string' && imgs){
        imgs = imgs.split(';');
        if(typeof cb === 'function'){
          cb(imgs);
        }
      }
    }, 'desc');
  };

  //
  var TabItemView = Backbone.View.extend({
    initialize: function(){
      this.$tab = $('<div class="item">').attr('id', this.model.get('id')).text(this.model.get('title'));
      this.$panel = $('<div class="item">')
                      .attr('for', this.model.id)
                      .css('width', '1010px')
                      .css('height', this.getHeight() + 'px')
                      .css("display", "none");
      
      var me = this;
      // 页面结构搭建完成以后执行
      pageReady(function(){
        editor.init(me.$panel);
        editor.hide();
      });
      
      // 激活当前tab
      this.$tab.click(function(){
        me.model.active();
      });
      
      this.lastHeight = 0;
      $(window).resize(function(){
        if(me.$tab.hasClass('active')){
          var height = $(document).height() - 32;
          me.$panel.css('height', height + 'px');
          if(me.lastHeight !== height){
            me.lastHeight = height;
            me.trigger('resize');
            editor.refresh();
          }
        }
      });

      // 动态设置编辑区高度
      this.on('resize', this.onResize, this);

      // 和schema之间的通信
      as.schema.on('schemaChanged', this.onSchemaChanged, this);

      // before save
      as.schema.registerBeforeSaveHandler(function(notifyFinishedCb){
        if(!me.field){
          notifyFinishedCb();
          return;
        }

        me.field.setValue(editor.getHtml());
        notifyFinishedCb();
      });

      // 自适应发布助手提示条
      assistant.on('updateErrors', this.onAssistantChanged, this);
      assistant.on('clearErrors', this.onAssistantChanged, this);
      assistant.on('heightChanged', this.onAssistantChanged, this);
    },

    active: function(){
      isActived = true;
      this.$tab.addClass('active');
      this.$panel.css('height', this.getHeight() + 'px');
      this.$panel.css('display', 'block');

      editor.show();
      editor.fitSize(this.$panel);
      editor.refresh();
    },

    deactive: function(){
      isActived = false;
      editor.hide();
      this.$tab.removeClass('active');
      this.$panel.css('display', 'none');
    },

    getHeight: function(){
      var height = document.documentElement.clientHeight - 32;
      if(assistant.hasError()){
        height -= assistant.height();
      }

      return height;
    },

    id: function(){
      return this.model.get('id');
    },

    onResize: function(){
      this.$panel.css('height', this.getHeight() + 'px');
      editor.fitSize(this.$panel);
    },

    onSchemaChanged: function(){
      // 保存实时html
      editor.clearHtmlCache();

      // 解开之前的事件连接
      if(this.field){
        this.field.off('focus', this.onFocus, this);
        this.field.off('hasError', this.onHasError, this);
        this.field.off('noError', this.onNoError, this);
      }

      this.field = as.schema.find(FIELD_ID);
      if(this.field){
        // 有宝贝描述
        this.$tab.removeClass('has-error');
        editor.setHtml(this.field.value());
        if(isActived){
          editor.refresh();  
        }

        // 事件连接
        this.field.on('focus', this.onFocus, this);
        this.field.on('hasError', this.onHasError, this);
        this.field.on('noError', this.onNoError, this);
      }else{
        // 没有宝贝描述
        editor.setHtml('');
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
      if(this.$tab.hasClass('active') > 0){
        this.active();
      }
    }
  });

  //
  module.exports = TabItemView;
});