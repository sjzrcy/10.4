/**
 * model: field
 */

define(function(require, exports, module){
  //
  var base = require('src/schema/ui/base/index');
  var SkuSizeView = require('src/schema/ui/sku/metas/size/size');
  var BaseView = require('src/schema/baseview');
  
  //
  var View = BaseView.extend({
    tagName: 'div',
    className: 'schema',

    initialize: function(){
      // 继承BaseView
      BaseView.prototype.initialize.apply(this, arguments);
      
      // 数据准备
      this.top = new base.TopSchemaView({model: this.model});
      this.size = new SkuSizeView({model: this.model});
      this.bottom = new base.BottomSchemaView({model: this.model});
    },

    render: function(){
      this.$el.empty();
      
      this.top.render();
      this.$el.append(this.top.$el);

      this.size.render();
      this.$el.append(this.size.$el);

      this.bottom.render();
      this.$el.append(this.bottom.$el);
    }
  });

  //
  View.supportExtend = true;

  //
  module.exports = View;
});