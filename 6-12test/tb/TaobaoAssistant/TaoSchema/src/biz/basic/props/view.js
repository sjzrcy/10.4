/**
 * 
 */

define(function(require, exports, module){
  //
  var PropView = require('src/schema/ui/props/structure/prop');
  var SchemaTopView = require('src/schema/ui/base/schematop');
  var viewService = require('src/schema/service/viewservice');

  //
  var LayoutView = require('src/schema/layout/view');
  var service = require('src/base/service');

  // 判断是否为类目属性组件
  var isProp = function(field){
    var isProp = false;
    if(_.isObject(field) && field.id && (typeof(field.id) === 'string')){
      isProp = (field.id.indexOf('prop_') >= 0);
    }

    return isProp;
  };

  //
  var View = Backbone.View.extend({
    tagName: 'div',
    className: 'props schema',

    initialize: function(){
      this.model.on('schemaChanged', this.render, this);
      as.schema.on('basicPageActived', this.update, this);
      as.schema.on('propRemoved', this.onComponentRemoved, this);
      as.schema.on('propAdded', this.onComponentAdded, this);
    },

    render: function(){
      //
      this.$el.empty();
      
      // render top
      var top = new SchemaTopView({'model': this.model});
      top.render();
      this.$el.append(top.$el);

      // render schema
      var layoutModel = this.model.get('layoutModel');
      if(!_.isObject(layoutModel)){
        return;
      }

      this.props = [];
      var $props = $('<div class="prop-box">');
      this.$el.append($props);

      if(_.isArray(layoutModel.children()) && layoutModel.children().length > 0){
        var me = this;
        _.each(layoutModel.children(), function(prop){
          var view = new PropView({'model': prop});
          prop.on('disableStatusChanged', me.onPropVisibilityChanged, me);
          if(!isProp(prop)){
            var ViewConstructor = viewService.get(prop.get('type'));
            if(ViewConstructor){
              view = new ViewConstructor({'model': prop});
            }else{
              error('类目组件下，子组件>>' + prop.id + ', type>>' + prop.get('type') + '不支持');
              return;
            }
          }else{
            view = new PropView({'model': prop});
          }

          me.props.push(view);
          view.render();
          $props.append(view.$el);
        });
      }else{
        $props.css('background-color', '#f6f6f6').append($('<div class="props-empty-tip">').text('该类目下不需要填写宝贝属性'));
      }
    },

    update: function(){
      var top = 0;
      for(var i = 0; i < this.props.length; ++i){
        var $prop = this.props[i].$el;
        if($prop.is(':visible')){
          $prop.css('top', (top + 'px'));
          top -= 1;
        }
      }
    },

    onPropVisibilityChanged: function(){
      /* 依赖可能会引发连锁操作，此处为优化 */
      if(this.timer){
        clearTimeout(this.timer);
        this.timer = undefined;
      }

      var me = this;
      this.timer = setTimeout(function(){
        me.update();
      }, 20);
    },

    find: function(id){
      return (_.find(this.props, function(prop){
        return (prop.model.id === id);
      }));
    },

    remove: function(id){
      var findIndex;
      _.find(this.props, function(prop, index){
        if(prop.model.id === id){
          findIndex = index;
          return true;
        }
      });

      if(findIndex !== undefined){
        this.props.splice(findIndex, 1);
      }
    },

    insertAfter: function(id, view){
      var findIndex;
      _.find(this.props, function(prop, index){
        if(prop.model.id === id){
          findIndex = index;
          return true;
        }
      });

      if(findIndex !== undefined){
        this.props.splice(findIndex + 1, 0, view);
      }else{
        this.props.push(view);
      }
    },

    // 移除组件id
    onComponentRemoved: function(ids){
      if(_.isArray(ids) && ids.length > 0){
        var me = this;
        _.each(ids, function(id){
          var view = me.find(id);
          if(view){
            view.$el.remove();
            me.remove(id);
          }
        });

        this.update();
      }
    },

    // 将id对应的组件，插入到pid后面
    onComponentAdded: function(pid, subProps){
      var pView = this.find(pid);
      if(pView && _.isArray(subProps) && subProps.length > 0){
        var frontView = pView;
        var me = this;
        _.each(subProps, function(field){
          if(frontView && field){
            field.set('prop', true);
            field.on('disableStatusChanged', me.onPropVisibilityChanged, me);
            var view = new PropView({'model': field});
            me.insertAfter(frontView.model.id, view);
            view.render();
            view.$el.insertAfter(frontView.$el);

            // 顺序插入
            frontView = view;
          }
        });

        setTimeout(function(){
          me.update();
        }, 40);
      }
    }
  });

  //
  module.exports = View;
});