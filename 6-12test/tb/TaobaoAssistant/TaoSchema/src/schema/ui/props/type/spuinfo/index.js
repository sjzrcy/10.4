define(function(require, exports, module){
  /**/

  var BaseView = require('src/schema/baseview');
  module.exports = BaseView.extend({
    tagName: 'div',
    className: 'schema prop spuinfo',
   
    initialize: function(){
      BaseView.prototype.initialize.apply(this, arguments);
      this.model.on('stateUpdated', this.render, this);
    },

    render: function(){
      this.$el.empty();
      var pairs = this.model.get('ui');
      if(!_.isArray(pairs) || pairs.length === 0){
        this.$el.hide();
        return;
      }

      this.$el.show();

      // 渲染 
      var me = this;
      _.each(pairs, function(pair){
        me.$el.append(me.renderOnePair(pair));
      });
    },

    renderOnePair: function(pair){
      return $('<div class="pair"><span class="label">' + pair.label + '</span><span class="text">' + pair.value + '</span></div>');
    }
  });
});