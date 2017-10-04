define(function(require, exports, module){
  var ID = 'currentComponentId';
  var J_NODE = 'currentDomNode';

  var helper = require('src/base/common/helper/index');
  var domReady = require('domReady');

  var Model = Backbone.Model.extend({
    initialize: function(){

    },

    init: function(items){
      helper.init(items);
    },

    reset: function(){
      //helper.reset();
    },

    setCurrentComponent: function(id, $el){
      warn(id);
      this.set(ID, id);
      this.set(J_NODE, $el);
    }
  });

  // ---------------------------------------------------------------
  var filter = new Model({});
  domReady(function(){
    $('body').keyup(function(){
      // 'F2' === 113
      var id = filter.get(ID);
      var $el = filter.get(J_NODE);
      if(id && $el && $el.is(':visible') && event.which === 113){
        helper.onHelperChanged(id, $el);
      }
    });
  });

  // 导出
  module.exports = filter;
});