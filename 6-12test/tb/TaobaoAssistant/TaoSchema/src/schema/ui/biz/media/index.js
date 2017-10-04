/**
 * 多媒体组件
 * 
 *
 * 模式： 
 * 1.普通 - （图片）， （图片 + 视频）， 
 * 2.TAB -（图片 + 竖图），（图片 + 视频 + 竖图 + 无线图片）
 * 
 */

define(function(require, exports, module){
  //
  var MediaView = require('src/schema/ui/biz/media/media/mediaview');
  var TabMediaView = require('src/schema/ui/biz/media/tab/tabmediaview');

  module.exports = Backbone.View.extend({
    initialize: function(){
      var config = {mediaImage: false, verticalImage: false, wirelessImage: false};
      _.find(this.model.children(), function(child){
        var type = child.get('type');
        if(type === 'media-image'){
          config.mediaImage = true;
        }else if(type === 'vertical-image'){
          config.verticalImage = true;
        }else if(type === 'layout' && child.get('biz') === 'wireless-image'){
          config.wirelessImage = true;
        }
      });

      if(config.mediaImage || config.wirelessImage){
        this.model.set('config', config);
        this.view = new TabMediaView({model: this.model});
      }else{
        this.view = new MediaView({model: this.model});
      }

      // 嫁接
      this.setElement(this.view.el);
    },

    render: function(){
      this.view.render();
    }
  });
});