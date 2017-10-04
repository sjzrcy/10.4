/**
 *
 * id
 * title
 * parent 
 *
 */

define(function(require, exports, module){
  //
  var schemaService = require('src/schema/schema');

  //
  var OtherModel = Backbone.Model.extend({
    events: {
      'schemaChanged': '作为父容器，需要处理全局schema信号，并向view发送schema信号'
    },

    initialize: function(){
      // bind
      schemaService.on('schemaChanged', this.onSchemaChanged, this);
    },

    active: function(){
      var parent = this.get('parent');
      parent.moveTo(this.id);
    },

    onSchemaChanged: function(){
      var layoutModel = schemaService.getLayout(this.get('id'));
      this.set('layoutModel', layoutModel);
      this.trigger('schemaChanged');
    }
  });

  module.exports = OtherModel;
});