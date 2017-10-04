/*
 *
 */

define(function(require, exports, module){
  //
  var MetasModel = require('src/schema/ui/sku/metas/model');
  var TableModel = require('src/schema/ui/sku/table/model');

  //
  var Model = Backbone.Model.extend({
    find: function(id){
      var sku = this.get('sku');
      var children = sku.children();
      if(!children || !children.length){
        return;
      }

      return (_.find(children, function(child){
        return (child['id'] === id);
      }));
    },

    initialize: function(){
      var table = this.find('sku');
      var metas = this.find('sku-metas');
      var inputs = this.find('sku-inputs');
      if(!table || !metas || !inputs){
        return;
      }

      metas = new MetasModel({'metas': metas, 'parent': this});
      metas.set('allsale', table.get('allsale'));
      this.set('metas', metas);

      table = new TableModel({'table': table, 'inputs': inputs, 'metas': metas, 'parent': this});
      this.set('table', table);

      // 将自定义销售属性注入到sku中
      var customSku = this.find('saleprop_custom');
      if(customSku){
        customSku.set('metas', metas);
        this.set('custom', customSku);
      }
    }
  });

  //
  module.exports = Model;
});