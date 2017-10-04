/**
 * 
 */

define(function(require, exports, module){
  //
  var LayoutView = require('src/schema/layout/view');

  // 资质保存前需要清空一次，因为异步N次后，其下字段很多字段都已经失效了
  var beforeSaveHandle = function(notifyFinishedCb){
    as.schema.removeBizData('qualification');
    notifyFinishedCb();
  };

  //
  var View = Backbone.View.extend({
    initialize: function(){
      var me = this;
      this.$tab = $('<div>').addClass('main-item')
                  .attr('id', this.model.get('id'))
                  .text(this.model.get('title'))
                  .click(function(){
                      me.model.active();
                  });

      this.$panel = $('<div>').addClass('main-sub-panel qualification clearfix').attr('link', this.model.get('id'));
      this.model.on('schemaChanged', this.render, this);

      as.schema.unregisterBeforeSaveHandler(beforeSaveHandle);
      as.schema.registerBeforeSaveHandler(beforeSaveHandle);
    },

    render: function(){
      //
      this.$panel.empty();
      this.$panel.append(this.renderHeader());
      this.doVisibility();

      // render schema
      var layoutModel = this.model.get('layoutModel');
      if(layoutModel){
        var layoutView = new LayoutView({model: layoutModel});
        layoutView.render();
        this.$panel.append(layoutView.$el);
      }
    },

    renderHeader: function(){
      return $('<div class="qualification-header">').text('商品资质');
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
  module.exports = View;
});