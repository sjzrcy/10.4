/*
 * 
 */
define(function(require, exports, module){
  //
  var BaseDialog = require('src/base/common/dialog/dialog');
  var ID = 'F9FD5B8E7874497F854580246D5F5C11';
  var url = 'http://stream.daily.taobao.net/plugin.htm?pageSize=8&ver=0.0.7';
    var picker = undefined;

  //
  module.exports = BaseDialog.extend({
    initialize: function(){
      BaseDialog.prototype.initialize.apply(this, arguments);
      $('.dialog', this.$el).css('width', '890px');
      $('.content', this.$el).css('width', '888px');
      this.$panel.attr('id', ID).css('height', '537px').addClass('imagespace-iframe-container');
    },

    render: function(){
      this.$panel.empty();
      this.$el.appendTo($('body'));
      this.run();
    },

    // iframe高度更新，height为数字，单位像素
    onHeightUpdate: function(height){
      this.$panel.css('height', (height + 6) + 'px');
    },

    // 插入图片 [url0, url1, ...]
    onPicInserted: function(urls){
      if(_.isArray(urls) && urls.length){
        var cb = this.model.cb;
        if(typeof cb === 'function'){
          cb(urls.join(';'));
        }
      }

      if(picker){
        picker.close();
        this.close();
      }
    },

    // 关闭
    onClosed: function(){
      if(picker){
        picker = undefined;
      }

      this.close();
    },

    run: function(){
      if(picker){
        picker = undefined;
      }

      var max = this.model.max;
      if(!max){
        max = 5;
      }

      var opts = {
        offset: {
          top: 0,
          left: 0
        },
        containerId: ID,
        pluginType: 0,
        from: 'as',
        pluginUrl: url,
        maxNum: max
      };

      picker = __picPlugin__.init(opts);
      picker.on('heightUpdated', this.onHeightUpdate.bind(this));
      picker.on('picInserted', this.onPicInserted.bind(this));
      picker.on('close', this.onClosed.bind(this));

      var pluginUrl = picker.getPluginUrl();
      as.shell.getAutoLoginUrl(encodeURIComponent(pluginUrl), function(jsonstr){
        picker.setPluginUrl(as.util.fetchUrl(jsonstr));
        picker.run();
      });
    }
  });
});