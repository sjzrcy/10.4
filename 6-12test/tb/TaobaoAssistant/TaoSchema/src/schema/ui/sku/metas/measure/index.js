/*
 sku度量衡
 */
define(function(require, exports, module){
  var SchemaTop = require('src/schema/ui/base/schematop');;
  var SchemaBottom = require('src/schema/ui/base/schemabottom');
  var SkuMeasure = require('src/schema/ui/sku/metas/measure/measure');
  var BaseView = require('src/schema/baseview');

  var View = BaseView.extend({
    tagName: 'div',
    className: 'schema',

    initialize: function(){
      // 继承BaseView
      BaseView.prototype.initialize.apply(this, arguments);
      
      this.top = new SchemaTop({model: this.model});
      this.bottom = new SchemaBottom({model: this.model});
      this.measure = new SkuMeasure({model: this.model});
    },

    render: function(){
      this.$el.empty();

      this.top.render();
      this.$el.append(this.top.$el);

      this.measure.render();
      this.$el.append(this.measure.$el);

      this.bottom.render();
      this.$el.append(this.bottom.$el);
    }
  });

  module.exports = View;
});