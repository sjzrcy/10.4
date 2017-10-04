define(function(require, exports, module){
  var Field = require('src/schema/field');
  var BaseView = require('src/schema/baseview');
  var SaleProp = require('src/schema/ui/sku/metas/custom/saleprop');
  
  var MIN = 0; // 维持当前最小的负数id
  var isValid = function(prop){
    return (_.isObject(prop) && prop.value);
  }

  var hasValidOption = function(list){
    var has = false;
    if(_.isArray(list)){
      _.find(list, function(option){
        if(option.value && option.text){
          has = true;
          return true;
        }
      });
    }

    return has;
  };

  var tryUpdateMIN = function(id){
    var n = Number(id.substr(5));
    if(n < MIN){
      MIN = n;
    }
  };

  module.exports = BaseView.extend({
    tagName: 'div',
    className: 'schema custom-sale',

    events: {
      'click .add-sale-prop-btn': function(){
        if(this.canAddMore()){
          this.renderEmptyProp();
        }else{
          as.util.showErrorTip('最多只能添加' + this.model.get('maxItems') + '个商品规格');
        }
      }
    },

    initialize: function(){
      BaseView.prototype.initialize.apply(this, arguments);
    },

    render: function(){
      this.$el.empty();
      this.renderProps();
      if(this.canAddMore()){
        this.renderAddButton();
      }
    },

    updateAddButton: function(){
      if(this.canAddMore()){
        this.renderAddButton();
      }else{
        this.removeAddButton();
      }
    },

    renderProps: function(){
      var props = this.model.value();
      if(!_.isArray(props)){
        return;
      }

      var me = this;
      _.each(props, function(prop){
        tryUpdateMIN(prop.value);
        me.$el.append(me.renderOneProp(prop));
      });

      // 和sku做一个通信
      this.updateValidProps();
    },

    canAddMore: function(){
      var maxItems = Number(this.model.get('maxItems'));
      if(maxItems > 0){
        var props = this.model.get('props');
        var size = _.isArray(props)? props.length: 0;
        return size < maxItems;
      }else{
        return true;
      }
    },

    renderAddButton: function(){
      var $btn = this.$('.add-sale-prop-btn');
      if($btn.length === 0){
        $btn = $('<div class="add-sale-prop-btn">').text('+自定义商品规格');
        this.$el.append($btn);
      }
    },

    removeAddButton: function(){
      var $btn = this.$('.add-sale-prop-btn');
      $btn.remove();
    },

    renderEmptyProp: function(){
      var prop = {
        text: '',
        value: 'prop_' + (MIN -= 1),
        items: []
      };

      this.renderOneProp(prop).insertBefore(this.$('.add-sale-prop-btn'));
    },

    renderOneProp: function(prop){
      if(!isValid(prop)){
        return;
      }

      var config = {
        id: prop.value,
        title: prop.text,
        type: 'custom_sale_prop',
        customsale: true,
        submit: false,
        options: prop.items,
        titleMaxLength: this.model.get('maxLength'),
        valueMaxItems: this.model.get('valueMaxItems'),
        valueMaxLength: this.model.get('valueMaxLength')
      };

      var item = {
        id: config.id,
        schema: null,
        ui: config,
        value: prop.items
      };

      var field = new Field({'schemaItem': item});
      this.insert(field);
      as.schema.addOneField(field);

      var view = new SaleProp({model: field});
      view.manager = this;
      view.render();

      return view.$el;
    },

    isTitleRepeat: function(title, field){
      var isRepeat = false;
      var props = this.model.get('props');
      if(!_.isArray(props)){
        return isRepeat;
      }

      _.find(props, function(prop){
        if(prop !== field && prop.get('title') === title){
          isRepeat = true;
          return true;
        }
      });

      return isRepeat;
    },

    remove: function(field){
      as.schema.removeOneField(field.id);
      _.find(this.model.get('props'), function(prop, index, list){
        if(field === prop){
          list.splice(index, 1);
          return true;
        }
      });

      this.updateAddButton();
      this.updateValidProps();
    },

    insert: function(field, index){
      var props = this.model.get('props');
      if(!_.isArray(props)){
        props = [];
        this.model.set('props', props);
      }

      if(index === undefined){
        props.push(field);
      }else{
        props.splice(index, 0, field);
      }
    },

    updateValidProps: function(){
      // 更新属性时，同时更新一次元自定义销售属性
      this.onUpdate();

      var validList = [];
      _.each(this.model.get('props'), function(field){
        if(field.get('title') && hasValidOption(field.value())){
          validList.push(field);
        }
      });

      // 更新metas的自定义部分
      var metas = this.model.get('metas');
      metas.updateCustomProps(validList);
    },

    // 更新自定义销售属性自身
    onUpdate: function(){
      var props = [];
      _.each(this.model.get('props'), function(field){
        props.push({
          "text": field.get('title'),
          "value": field.id,
          "items": field.value()
        });
      });

      this.model.setValue(props);
    }
  });
});