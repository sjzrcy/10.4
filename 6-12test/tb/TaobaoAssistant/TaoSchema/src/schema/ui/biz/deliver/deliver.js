/**
 * 
 */

define(function(require, exports, module){
  //
  var DELIVER_WAY = 'deliverWay';
  var ETC = 'etc';
  var NEWETC = 'newEtc';
  var DELIVER_TEMPLATE = 'deliverTemplate';
  var DELIVER_WEIGHT = 'deliveryParams.deliverWeight';
  var DELIVER_VOLUMN = 'deliveryParams.deliverVolumn';

  var DeliverTemplateView = require('src/schema/ui/biz/deliver/template/view');
  var DeliverETCView = require('src/schema/ui/biz/deliver/etc/view');

  //
  var View = Backbone.View.extend({
    tagName: 'div',
    className: 'deliver',

    initialize: function(){
      

      var children = this.model.children();
      var find = function(id){
        return (_.find(children, function(child){
          return (child.id === id);
        }));
      };

      this.deliverWay = find(DELIVER_WAY);
      if(this.deliverWay){
        this.deliverWay.on('focus', this.onFoucs, this);
        this.deliverWay.on('readonlyStatusChanged', this.render, this);
        this.deliverWay.on('valueUpdated', this.render, this);
      }

      this.deliverWeight = find(DELIVER_WEIGHT);
      this.deliverVolumn = find(DELIVER_VOLUMN);

      this.deliverTemplate = find(DELIVER_TEMPLATE);
      this.etc = find(ETC);
      if(!this.etc){
        this.etc = find(NEWETC);
      }
    },

    render: function(){
      this.$el.empty();

      if(this.deliverTemplate){
        var deliverTemplate = new DeliverTemplateView({'model': {
          'field': this.deliverTemplate, 
          'optionField': this.deliverWay, 
          'weight': this.deliverWeight,
          'volumn': this.deliverVolumn
        }});
        
        if(this.etc){ // 如果存在电子凭证，则显示分隔线
          deliverTemplate.$el.css('border-bottom', 'solid 1px #d7d7d7');
        }

        deliverTemplate.render();
        this.$el.append(deliverTemplate.$el);
      }
      
      if(this.etc){
        var etc = new DeliverETCView({'model': {'field': this.etc, 'optionField': this.deliverWay}});
        etc.render();
        this.$el.append(etc.$el);
      }
    }, 

    onFoucs: function(){
      as.util.scrollTo(this.el);
    }
  });

  //
  module.exports = View;
});