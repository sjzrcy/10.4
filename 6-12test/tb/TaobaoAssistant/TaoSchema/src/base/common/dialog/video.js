/*
 * 
 */
define(function(require, exports, module){
  //
  var BaseDialog = require('src/base/common/dialog/dialog');
  var ID = 'F9E8FE04F4BC4FF0AFB4EB1BEA207F9C';
  var url = 'http://stream.daily.taobao.net/video/video.htm?pageSize=8&ver=0.0.7';
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

    // vid, preview
    onPicInsertedWithInfo: function(infos){
      if(_.isArray(infos) && infos.length > 0){
        var video = {};
        var info = infos[0];
        if(typeof info === 'object'){
          video.vid = info.fileId;
          video.preview = info.publishedUrl;
        }

        var cb = this.model.cb;
        if(typeof cb === 'function'){
          cb(JSON.stringify(video));
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
        singleSelect: true,
        pluginType: 1,
        containerId: ID,
        from: 'as',
        pluginUrl: url,
        maxNum: max
      };

      picker = __picPlugin__.init(opts);
      picker.on('heightUpdated', this.onHeightUpdate.bind(this));
      picker.on('picInsertedWithInfo', this.onPicInsertedWithInfo.bind(this));
      picker.on('close', this.onClosed.bind(this));

      var pluginUrl = picker.getPluginUrl();
      as.shell.getAutoLoginUrl(encodeURIComponent(pluginUrl), function(jsonstr){
        picker.setPluginUrl(as.util.fetchUrl(jsonstr));
        picker.run();
      });
    }
  });
});