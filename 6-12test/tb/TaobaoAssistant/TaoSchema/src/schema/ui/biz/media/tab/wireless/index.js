define(function(require, exports, module){
  /*
  成员约定
  .$tab
  .$content
  接口约定
  active
  deactive
   */

  var Reminder = require('src/schema/ui/base/reminder');
  var service = require('src/schema/service/viewservice');

  module.exports = Backbone.View.extend({
    initialize: function(){
      var me = this;
      this.$tab = $('<div class="media-tab" style="width: 80px">').click(function(){
        me.model.parent.active(me);
      });

      this.$content = $('<div class="media-content">');
    },

    render: function(){
      this.renderTab();
      this.renderContent();
    },

    renderTab: function(){
      this.$tab.empty();

      var title = this.model.layout.getBizAttr('title');
      title = title? title: '手机端主图';
      this.$tab.append($('<span>' + title + '</span>'));

      var reminder = this.model.layout.getBizAttr('reminder');
      if(_.isObject(reminder) && !_.isArray(reminder)){
        reminder = [reminder];
      }
      if(_.isArray(reminder) && reminder.length > 0){
        var me = this;
        _.each(reminder, function(reminder){
          var view = new Reminder({model: reminder});
          view.render();
          view.$el.removeClass('clearfix').css('display', 'inline-block');
          view.$('.icon-box').css('top', '4px');
          me.$tab.append(view.$el);
        });
      }
    },

    renderContent:function(){
      this.$content.empty();

      var me = this;
      _.each(this.model.layout.children(), function(field){
        var View; // 构造函数
        var view; // ui实例
        var type = field.get('type');
        if(type === 'layout'){
          View = service.get(field.get('biz'));
          if(View){
            view = new View({model: {layout: field, parent: me}})
          }
        }else{
          View = service.get(field.get('type'));
          if(View){
            view = new View({model: field});
          }
        }
        
        if(view){
          view.render();
          me.$content.append(view.$el);
        }
      });
    },

    active: function(){
      this.$tab.addClass('media-tab-active');
      this.$content.show();
    },

    deactive: function(){
      this.$tab.removeClass('media-tab-active');
      this.$content.hide();
    }
  });
});