/*
 sku时间区间
 */
define(function(require, exports, module){
  var SchemaTop = require('src/schema/ui/base/schematop');;
  var SchemaBottom = require('src/schema/ui/base/schemabottom');
  var SkuTimeRange = require('src/schema/ui/sku/metas/timerange/timerange');
  var BaseView = require('src/schema/baseview');

  module.exports = BaseView.extend({
    tagName: 'div',
    className: 'schema',

    initialize: function(){
      // 继承BaseView
      BaseView.prototype.initialize.apply(this, arguments);
      
      this.top = new SchemaTop({model: this.model});
      this.bottom = new SchemaBottom({model: this.model});
      this.timeRange = new SkuTimeRange({model: this.model});
    },

    render: function(){
      this.$el.empty();

      this.top.render();
      this.$el.append(this.top.$el);

      this.timeRange.render();
      this.$el.append(this.timeRange.$el);

      this.bottom.render();
      this.$el.append(this.bottom.$el);
    }
  });
});