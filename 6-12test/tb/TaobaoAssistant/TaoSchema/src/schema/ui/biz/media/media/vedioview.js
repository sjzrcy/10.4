/**
 * 状态：
 * 1.无值，显示添加样式
 * 2.有值，显示背景图以及删除交互（preview）
 * 
 * 接口：
 * 1.setValue(url),设置当前图片
 * 2.reset，清空值，回归初始状态
 *
 * IN:
 * parent：容器
 * field：对应的model（image）
 * mode：容器当前的模式（支持5还是6个项）
 * index: 在容器中的序号
 */

define(function(require, exports, module){
  //
  var View = Backbone.View.extend({
    initialize: function(){
      
    },

    render: function(){
      var me = this;
      this.$thumbnail = $('<span class="sub">');
      this.renderThumbnail();
      this.$thumbnail.click(function(){
        me.onClick(me.$preview);
      });
      
      this.$preview = $('<div class="preview-vedio">');
      this.renderPreview();
      this.$preview.click(function(){
        me.onClick(me.$preview);
      });
    },

    renderThumbnail: function(){
      this.$arrow = $('<div>').addClass('arrow');
      this.$image = $('<div>').addClass('thumbnail' + this.model.mode);
      this.$thumbnail.append(this.$arrow).append(this.$image);

      // 此处应该是获取缩略图
      var me = this;
      var vid = this.getValue();
      if(vid){
        this.$image.removeClass('add-video');
        as.shell.getVideoPreview(vid, function(preview){
          var obj;
          try{
            obj = JSON.parse(preview);
          }catch(e){
            obj = {url: ''}; // @ZZ 加载视频缩略图失败！
          }
          me.$image.css('background-image', 'url("' + encodeURI(obj.url) + '")');
        });
      }else{
        this.$image.addClass('add-video');
      }

      this.$image.hover(function(){ //鼠标hover时抢占焦点
        me.model.parent.active(me.model.index);
      }, function(){});

      this.$image.click(function(){
        if(me.$image.hasClass('add-video')){
          as.shell.chooseVideo(function(video){
            try{
              video = JSON.parse(video);  
            }catch(e){
              video = {};
            }
            
            var preview = video.preview;
            var vid = parseInt(video.vid);
            if(_.isNumber(Number(vid)) && preview){
              me.setValue(vid, preview);
              as.shell.setVideoPreview(vid, preview);
            }
          });
        }
      });

      this.$arrow.css('visibility', 'hidden');
    },

    renderPreview: function(){
      var me = this;
      this.$remove = $('<div class="remove-icon">').attr('title', '删除').click(function(){
        me.reset();
      });
      
      this.$tip = $('<div class="tip"><img align="top" src="../img/play-small.png"/><span class="text">&nbsp;9秒主图视频</span></div>');
      this.$play = $('<div class="play">');

      // 此处应该是获取缩略图
      var vid = this.getValue();
      if(vid){
        as.shell.getVideoPreview(vid, function(preview){
          var obj;
          try{
            obj = JSON.parse(preview);
          }catch(e){
            obj = {url: ''}; // @ZZ 加载视频缩略图失败！
          }
          me.$preview.css('background-image', 'url(' + obj.url + ')');
        });
        this.$preview.append(this.$remove);
        this.$preview.append(this.$play);
      }else{
        this.$preview.append(this.$tip);
      }

      this.$preview.hide();
    },

    active: function(){
      this.$preview.show();
      this.$arrow.css('visibility', 'visible');
      this.$image.addClass('active');
    },

    deactive: function(){
      this.$preview.hide();
      this.$arrow.css('visibility', 'hidden');
      this.$image.removeClass('active');
    },

    onClick: function($el){
      this.model.field.setActive($el);
    },

    getValue: function(){
      var field = this.model.field;
      return field.value();
    },

    setValue: function(vid, preview){
      var field = this.model.field;
      field.setValue(vid);

      this.$preview.css('background-image', 'url(' + preview + ')');
      this.$tip.detach();
      this.$preview.append(this.$remove).append(this.$play);

      this.$image.removeClass('add-video').css('background-image', 'url(' + preview + ')');
    },

    reset: function(){
      var field = this.model.field;
      field.setValue(undefined);

      this.$preview.css('background-image', '');
      this.$remove.detach();
      this.$play.detach();
      this.$preview.append(this.$tip);

      this.$image.addClass('add-video').css('background-image', '');
    }
  });

  //
  module.exports = View;
});