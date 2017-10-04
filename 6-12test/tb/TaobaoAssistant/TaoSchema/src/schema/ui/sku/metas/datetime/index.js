/*
 sku时间点
 */
define(function(require, exports, module){
  var SchemaTop = require('src/schema/ui/base/schematop');;
  var SchemaBottom = require('src/schema/ui/base/schemabottom');
  var SkuDateTime = require('src/schema/ui/sku/metas/datetime/datetime');
  var BaseView = require('src/schema/baseview');

  module.exports = BaseView.extend({
    tagName: 'div',
    className: 'schema',

    initialize: function(){
      // 继承BaseView
      BaseView.prototype.initialize.apply(this, arguments);
      
      this.top = new SchemaTop({model: this.model});
      this.bottom = new SchemaBottom({model: this.model});
      this.datetime = new SkuDateTime({model: this.model});
    },

    render: function(){
      this.$el.empty();

      this.top.render();
      this.$el.append(this.top.$el);

      this.datetime.render();
      this.$el.append(this.datetime.$el);

      this.bottom.render();
      this.$el.append(this.bottom.$el);
    }
  });
});