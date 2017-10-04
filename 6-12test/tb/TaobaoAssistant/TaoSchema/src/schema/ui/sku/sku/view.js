/**
 * 
 */

define(function(require, exports, module){
  //
  var TableView = require('src/schema/ui/sku/table/view');
  var MetasView = require('src/schema/ui/sku/metas/view');
  var CustomSaleView = require('src/schema/ui/sku/metas/custom/index');

  //
  var View = Backbone.View.extend({
    tagName: 'div',
    className: 'sku-box clearfix',

    initialize: function(){
      
    },

    render: function(){
      this.$el.empty();

      // 销售属性会做一些修复性的工作，所以先渲染
      var metas = new MetasView({model: this.model.get('metas')});
      metas.render();
      this.$el.append(metas.$el);

      // 处理自定义销售属性（可选），它是销售属性的一个子区块
      var customField = this.model.get('custom');
      if(customField){
        var custom = new CustomSaleView({model: customField});
        custom.render();
        metas.$el.append(custom.$el);
      }

      // 左侧表格部分
      var table = new TableView({model: this.model.get('table')});
      table.render();
      this.$el.prepend(table.$el);
    }
  });

  //
  module.exports = View;
});