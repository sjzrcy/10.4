/**
 * 
 */

define(function(require, exports, module){
  //
  var MediaView = require('src/schema/ui/biz/media/media/mediacontent');

  var View = Backbone.View.extend({
    initialize: function(){
      var me = this;
      this.$tab = $('<div class="media-tab">').click(function(){
        me.model.parent.active(me);
      });
      this.$content = $('<div class="media-content">');

      this.content = new MediaView({model: {layout: this.model.layout, parent: this}});
    },

    render: function(){
      this.$tab.empty();
      this.$content.empty();

      this.renderTab();
      this.renderContent();
    },

    renderTab: function(){
      var isMust = (this.model.layout.get('must') === true);
      if(isMust){
        this.$tab.append($('<span class="must">').text('*'));
      }

      var title = this.model.layout.get('title');
      this.$tab.append($('<span>').text(title));
    },

    renderContent: function(){
      this.content.render();
      this.$content.append(this.content.$el);
    },

    onFocus: function(){
      as.util.twinkle(this.$tab);
    },

    onHasError: function(){
      this.$tab.addClass('has-error');
    },

    onNoError: function(){
      this.$tab.removeClass('has-error');
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

  //
  module.exports = View;
});