/**
 *
 */

define(function(require, exports, module){
  //
  module.exports = Backbone.View.extend({
    initialize: function(){
      var me = this;
      this.$thumbnail = $('<span class="sub">');
      this.$thumbnail.click(function(){
        me.onClick(me.$thumbnail);
      });

      this.$preview = $('<div class="preview-image">');
      this.$preview.click(function(){
        me.onClick(me.$preview);
      });

      var reminders = this.model.field.get('reminders');
      if(reminders.length > 0){
        this.reminder = reminders[0].text;  
      }
    },

    render: function(){
      this.$thumbnail.empty();
      this.$preview.empty();
      this.$preview.css('background-image', '').css('background-color', '#bbbbbb');
      
      this.renderThumbnail();
      this.renderPreview();
    },


    renderThumbnail: function(){
      this.$arrow = $('<div>').addClass('arrow');
      this.$image = $('<div>').addClass('thumbnail6 active');
      this.$thumbnail.append(this.$arrow).append(this.$image);

      var url = this.getUrl();
      if(url){
        this.$image.data('url', url).css('background-image', 'url("' + encodeURI(url) + '")');
      }else{
        this.$image.text('+');
      }

      var me = this;
      this.$image.click(function(){
        if(me.$image.text() === '+'){
          as.shell.choosePictures(function(images){
            log(images);
            if(_.isString(images)){
              images = images.split(';');
              if(images.length > 0){
                me.setValue(images[0]);
              }
            }
          }, 'sixthImg');
        }
      });
    },

    renderPreview: function(){
      var me = this;
      this.$remove = $('<div class="remove-icon">').attr('title', '删除').click(function(){
        me.resetValue();
      });

      this.$verticalPreview = $('<div class="vertical-preview">');
      this.$preview.append(this.$verticalPreview);

      var url = this.getUrl();
      if(url){
        this.$verticalPreview.css('background-image', 'url("' + encodeURI(url) + '")');
        this.$preview.append(this.$remove);
      }else{
        var $tip1 = $('<div class="vertical-tip"><span class="text">商品竖图</span></div>');
        if(this.model.field.get('must')){
          $tip1.prepend($('<span class="must">*</span>'));
        }
        var $tip2 = $('<div class="vertical-tip"><span class="text">2:3</span></div>');
        this.$verticalPreview.append($tip1).append($tip2);

        if(this.reminder){
          var $reminder = $('<div class="vertical-reminder">').html(this.reminder);
          as.util.handleATag($reminder);
          this.$verticalPreview.append($reminder);
        }
      }
    },

    onClick: function($el){
      this.model.field.setActive($el);
    },

    getUrl: function(){
      var value = this.model.field.value();
      if(_.isArray(value) && _.isObject(value[0])){
        return value[0].url;
      }
    },

    setValue: function(url){
      this.model.field.setValue([{
        'major': true,
        'position': 0,
        'url': url
      }]);

      this.render();
    },

    resetValue: function(){
      this.model.field.setValue(undefined);
      this.render();
    }
  });
  //
});