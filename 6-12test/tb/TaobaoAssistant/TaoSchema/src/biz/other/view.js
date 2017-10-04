/**
 * 
 */
define(function(require, exports, module){
  //
  var LayoutView = require('src/schema/layout/view');

  //
  var OtherView = Backbone.View.extend({
    initialize: function(){
      var me = this;
      this.$tab = $('<div>').addClass('main-item')
                  .attr('id', this.model.get('id'))
                  .text(this.model.get('title'))
                  .click(function(){
                      me.model.active();
                  });

      this.$panel = $('<div>').addClass('main-sub-panel other clearfix').attr('link', this.model.get('id'));
      if(this.model.get('id') === 'food'){
        this.$panel.css({"border-bottom": "solid 1px #d7d7d7"});
      }

      this.model.on('schemaChanged', this.render, this);
    },

    render: function(){
      this.$panel.empty();
      this.doVisibility();
      
      // render schema
      var layoutModel = this.model.get('layoutModel');
      if(layoutModel){
        var layoutView = new LayoutView({model: layoutModel});
        layoutView.render();
        this.$panel.append(layoutView.$el);
      }
    },

    doVisibility: function(){
      var layoutModel = this.model.get('layoutModel');
      if(layoutModel && !layoutModel.isEmpty()){
        this.$tab.show();
        this.$panel.show();
      }else{
        this.$tab.hide();
        this.$panel.hide();
      }
    }
  });

  //
  module.exports = OtherView;
});