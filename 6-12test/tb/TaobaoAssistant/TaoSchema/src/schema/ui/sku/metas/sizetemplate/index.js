
define(function(require, exports, module){
  //
  var base = require('src/schema/ui/base/index');
  var Template = require('src/schema/ui/sku/metas/sizetemplate/template');
  var BaseView = require('src/schema/baseview');
  
  var View = BaseView.extend({
    tagName: 'div',
    className: 'schema',

    initialize: function(){
      // 继承BaseView
      BaseView.prototype.initialize.apply(this, arguments);
      
      // 数据准备
      this.top = new base.TopSchemaView({model: this.model});
      this.template = new Template({model: this.model});
    },

    render: function(){
      this.$el.empty();
      
      this.top.render();
      this.$el.append(this.top.$el);

      this.template.render();
      this.$el.append(this.template.$el);
    }
  });

  //
  module.exports = View;
});