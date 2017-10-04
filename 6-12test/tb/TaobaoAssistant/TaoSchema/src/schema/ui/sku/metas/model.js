/**
 * IN:
 * metas
 * parent
 *
 * OUT:
 * 
 */

define(function(require, exports, module){
  //
  var Model = Backbone.Model.extend({
    initialize: function(){
      var metas = this.get('metas');
      var me = this;
      _.each(metas.children(), function(meta){
        meta.on('valueChanged', me.onSkuMetaChanged, me);
      });
    },

    isAllSale: function(){
      return (this.get('allsale') === true);
    },

    hasCompletedGroup: function(){
      if(this.isAllSale()){
        return this.isCompletedOnAllSale();
      }else{
        return this.isCompletedNoAllSale();
      }
    },

    isCompletedOnAllSale: function(){
      var isAllSaleMetaHasValue = true;
      var metas = this.get('metas');
      _.find(metas.children(), function(meta){
        if(!meta.isDisable() && meta.isSale()){
          var value = meta.value();
          if(as.util.isEmptyValue(value)){
            isAllSaleMetaHasValue = false;
            return true;
          }
        }
      });

      return isAllSaleMetaHasValue;
    },

    isCompletedNoAllSale: function(){
      var isAllMustSaleMetaHasValue = true;
      var metas = this.get('metas');
      _.find(metas.children(), function(meta){
        if(!meta.isDisable() && meta.isSale() && meta.isMust()){
          var value = meta.value();
          if(as.util.isEmptyValue(value)){
            isAllMustSaleMetaHasValue = false;
            return true;
          }
        }
      });

      return isAllMustSaleMetaHasValue;
    },

    onSkuMetaChanged: function(){
      this.trigger('skuMetaChanged');
    },

    getTitleOfEmptyMeta: function(){
      var titles = [];
      var metas = this.get('metas');
      var me = this;
      _.each(metas.children(), function(meta){
        if(!meta.isDisable() && meta.isSale()){
          var value = meta.value();
          if(me.isAllSale()){
            if(as.util.isEmptyValue(value)){
              titles.push(meta.get('title'));
            }
          }else{
            if(meta.isMust() && as.util.isEmptyValue(value)){
              titles.push(meta.get('title'));
            }
          }
        }
      });

      return titles;
    },

    children: function(){
      var metas = this.get('metas');
      return metas.children();
    },

    dataTypes: function(){
      var dataTypes = {};
      var metas = this.get('metas');
      _.each(metas.children(), function(child){
        dataTypes[child.id] = child.get('dataType');
      });

      return dataTypes;
    },

    hasContain: function(metas, id){
      var isContain = false;
      for(var i = 0; i < metas.length; ++i){
        if(metas[i].id === id){
          isContain = true;
          break;
        }
      }

      return isContain;
    },

    // 更新自定义销售属性，只接收有有效标题和有效选项的字段
    updateCustomProps: function(props){
      var isCustomProp = function(id){
        return (id.indexOf('prop_') === 0 && Number(id.substr(5)) < 0);
      };

      // 查找出所有自定义销售属性索引
      var metas = this.get('metas').children();
      var customIndexList = [];
      _.each(metas, function(meta, index){
        if(isCustomProp(meta.id)){
          customIndexList.push(index);
        }
      });

      // 从后往前，依次移除
      for(var i = customIndexList.length - 1; i >= 0; --i){
        metas[customIndexList[i]].off('valueChanged', this.onSkuMetaChanged, this);
        metas.splice(customIndexList[i], 1);
      }

      // 从前往后，依次添加
      for(var i = 0; i < props.length; ++i){
        props[i].on('valueChanged', this.onSkuMetaChanged, this);
        metas.push(props[i]);
      }

      // 自定义属性发生变化
      this.trigger('customPropCountChanged', metas);
    }
  });

  //
  module.exports = Model;
});