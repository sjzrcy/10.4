define(function(require, exports, module){
  var BaseView = require('src/schema/baseview');
  module.exports = BaseView.extend({
    tagName: 'div',
    className: 'schema',

    events: {
      'click': function(){
        this.doImport(); 
      }
    },

    initialize: function(){
      BaseView.prototype.initialize.apply(this, arguments);
    },

    render: function(){
      this.$el.html(this.model.get('text'));
    },

    doImport: function(){
      var from = as.schema.find(this.model.get('from'));
      var to = as.schema.find(this.model.get('to'));
      if(from && to){
        var value;
        var rawValue = from.value();
        if(_.isArray(rawValue)){
          value = rawValue.concat();
        }else if(_.isObject(rawValue)){
          value = _.extend({}, rawValue);
        }else{
          value = rawValue;
        }

        to.setValue(value);
        to.trigger('valueUpdated');
      }
    }
  });
});