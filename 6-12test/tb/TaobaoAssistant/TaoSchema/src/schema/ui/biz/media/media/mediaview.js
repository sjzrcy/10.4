/**
 * 
 */

define(function(require, exports, module){
  //
  var SchemaTopView = require('src/schema/ui/base/schematop');
  var MediaView = require('src/schema/ui/biz/media/media/mediacontent');

  module.exports = Backbone.View.extend({
    tagName: 'div',
    className: 'schema',

    initialize: function(){
      this.top = new SchemaTopView({model: this.model});
      this.media = new MediaView({model: {layout: this.model, parent: this}});
    },

    render: function(){
      this.$el.empty();

      this.top.render();
      this.$el.append(this.top.$el);

      this.media.render();
      this.$el.append(this.media.$el);
    },

    onHasError: function(){
      this.$('.title').addClass('has-error');
    },

    onNoError: function(){
      if(this.media.isImageAndVedioNoError()){
        this.$('.title').removeClass('has-error');
      }
    },

    onFocus: function(){
      as.util.twinkle(this.$('.title'));
    }
  });
  //
});