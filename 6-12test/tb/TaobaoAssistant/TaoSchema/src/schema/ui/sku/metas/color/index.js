/**
 *
 */

define(function(require, exports, module){
  //
  var base = require('src/schema/ui/base/index');
  var SkuColorView = require('src/schema/ui/sku/metas/color/color');
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
      this.color = new SkuColorView({model: this.model});
      this.bottom = new base.BottomSchemaView({model: this.model});
    },

    render: function(){
      this.$el.empty();
      
      this.top.render();
      this.$el.append(this.top.$el);

      this.color.render();
      this.$el.append(this.color.$el);

      this.bottom.render();
      this.$el.append(this.bottom.$el);
    }
  });

  //
  module.exports = View;
});