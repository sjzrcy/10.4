/**
 * 多媒体组件
 * 
 * IN:
 * biz会对应一个layout，整个layoutModel会输入进来
 * 在这种情况下，为什么业务组件仍然需要自己的组件model？不需要！
 * 
 * 关键要素：
 * 1.子项数量：5/6
 * 2.子项hover向上抛出
 * 3.向下提供setValue(index, value)接口
 * 4.current
 * 
 * 子项
 * 1.向上提供active和deactive接口
 * 2.hover事件向上传导
 * 
 */

define(function(require, exports, module){
  //
  var FIVE = 5;
  var SIX = 6;

  //
  var ImageView = require('src/schema/ui/biz/media/media/imageview');
  var VedioView = require('src/schema/ui/biz/media/media/vedioview');

  var View = Backbone.View.extend({
    tagName: 'div',
    className: 'com-media',

    initialize: function(){
      var me = this;
      var parent = this.model.parent;
      _.each(this.model.layout.children(), function(child){
        var type = child.get('type');
        if(type === 'media-image'){
          child.on('focus', me.onFocus, me);
          child.on('focus', parent.onFocus, parent);
          child.on('hasError', parent.onHasError, parent);
          child.on('noError', parent.onNoError, parent);
          child.on('valueUpdated', me.render, me);
          child.on('disableStatusChanged', me.onDisableStatusChanged, me);
          me.image = child;
        }else if(type === 'media-video'){
          child.on('focus', me.onFocus, me);
          child.on('focus', parent.onFocus, parent);
          child.on('hasError', parent.onHasError, parent);
          child.on('noError', parent.onNoError, parent);
          me.vedio = child;
        }
      });

      this.mode = (_.isObject(this.image) && _.isObject(this.vedio))? SIX: FIVE;
      this.model.layout.set({
        'must': true,
        'reminders': [],
        'title': this.mode === SIX? '图片和视频': '宝贝图片'
      });

      this.subs = [];
      var index = -1;
      if(_.isObject(this.vedio)){
        this.subs.push(new VedioView({model: {parent: this, field: this.vedio, mode: this.mode, index: ++index}}));
      }
      if(_.isObject(this.image)){
        for(var i = 0; i < 5; ++i){
          this.subs.push(new ImageView({model: {valueIndex: i, parent: this, field: this.image, mode: this.mode, index: ++index}}));
        }
      }else{
        error('宝贝图片业务数据缺失，请联系@艮离');
      }
    },

    render: function(){
      // 清空
      this.$el.empty();

      // render media
      var $previewBox = $('<div>').addClass('preview-box');
      var $bar = $('<div>').addClass('bar' + this.mode);
      if(this.mode === FIVE){
        $bar.sortable({
          stop: function(event, ui){
            me.onSort();
          }
        });
      }
      this.$el.append($previewBox).append($bar);

      var step = (this.mode === FIVE? 1.5: 1);
      _.each(this.subs, function(sub, index){
        sub.render();
        $bar.append(sub.$thumbnail.css('left', (index * step) + 'px'));
        $previewBox.append(sub.$preview);
      });

      // 激活一项
      if(this.mode === SIX){
        this.subs[1].active();
        this.current = 1;
      }else{
        this.subs[0].active();
        this.current = 0;
      }
    },

    onDisableStatusChanged: function(name, value){
      if(name === 'disable' && this.mode === FIVE){
        if(value === true){
          this.$el.hide();
        }else{
          this.$el.show();
        }
      }
    },

    // 当排序时，调整subs的顺序，然后重新渲染
    onSort: function(){
      var $bar = this.$('.bar' + this.mode);
      var images = [];
      var subs = [];
      var me = this;
      _.each($bar.children(), function(child, index){
        var $child = $(child);
        var url = $('.thumbnail' + me.mode, $child).data('url');
        if(url){
          images.push({
            position: index,
            major: index === 0,
            url: url
          });
        }
      });

      this.image.setValue(images);
      this.subs = [];
      var index = (this.mode === FIVE? -1: 0);
      for(var i = 0; i < 5; ++i){
        this.subs.push(new ImageView({model: {valueIndex: i, parent: this, field: this.image, mode: this.mode, index: ++index}}));
      }

      // 重选渲染
      this.render();
    },

    active: function(index){
      if(index !== this.current && index < this.subs.length){
        this.subs[this.current].deactive();
        this.subs[index].active();
        this.current = index;
      }
    },

    onFocus: function(){
      as.util.scrollTo(this.el);
    },

    setBackImage: function(index, images){
      var subIndex = index + 1;
      var imageIndex = 0;
      for( ; subIndex < this.subs.length && imageIndex < images.length; ++subIndex, ++imageIndex){
        this.subs[subIndex].setValue(images[imageIndex]);
      }
    },

    isImageAndVedioNoError: function(){
      var isImageOk = !this.image || (this.image && !this.image.hasError());
      var isVedioOk = !this.vedio || (this.vedio && !this.vedio.hasError());
      return (isImageOk && isVedioOk);
    }
  });

  //
  module.exports = View;
});