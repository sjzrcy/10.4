/**
 * 
 */

define(function(require, exports, module){
  //
  var service = require('src/schema/service/viewservice');

  //
  var View = Backbone.View.extend({
    tagName: 'div',
    className: 'sku-metas float-left',

    initialize: function(){

    },

    render: function(){
      var metas = this.model.get('metas');
      metas = metas.children();

      var me = this;
      _.each(metas, function(meta){
        if(!meta.get('render')){
          return;
        }
        
        var View = service.get(meta.get('type'));
        if(!View){
          return;
        }

        var view = new View({model: meta});
        view.render();
        me.$el.append(view.$el);
      });
    }
  });

  //
  module.exports = View;
});