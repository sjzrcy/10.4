/**/
define(function(require, exports, module){
  //
  var schemaService = require('src/schema/schema');
  var asyncService = require('src/schema/async/service');

  //
  var REFRESHQUALIFICATION = 'updateQualification';
  var FILLQUALIFICATION = 'fillQualification';

  //
  var Model = Backbone.Model.extend({
    events: {
      'schemaChanged': '作为父容器，需要处理全局schema信号，并向view发送schema信号'
    },

    initialize: function(){
      this.queue = [];
      schemaService.on('schemaChanged', this.onSchemaChanged, this);
    },

    reset: function(){
      // 移除事件
      var layoutModel = this.get('layoutModel');
      if(layoutModel){
        layoutModel.off('schemaRefreshed', this.onSchemaRefreshed, this);
      }

      // 移除异步回调
      _.each(this.queue, function(async){
        async.setCb(undefined);
      });
      this.queue = [];
    },

    active: function(){
      var parent = this.get('parent');
      parent.moveTo(this.id);
    },

    onSchemaChanged: function(){
      // 重置
      this.reset();

      // 更新数据
      var layoutModel = schemaService.getLayout(this.get('id'));
      if(layoutModel){
        layoutModel.on('schemaRefreshed', this.onSchemaRefreshed, this);
        this.set('layoutModel', layoutModel);
        this.initAsync();
        this.trigger('schemaChanged');
      }
    },

    onSchemaRefreshed: function(){
      this.trigger('schemaChanged');
    },

    initAsync: function(){
      var layoutModel = this.get('layoutModel');
      var async = layoutModel.get('async');

      var asyncs;
      if(_.isArray(async)){
        asyncs = async;
      }else if(_.isObject(async)){
        asyncs = [async];
      }

      var me = this;
      _.each(asyncs, function(async){
        if(_.isObject(async) && async.action){
          var Async = asyncService.get(async.action);
          if(_.isFunction(Async)){
            me.queue.push(new Async({async: async}));
          }
        }
      });

      this.initRefresh();
      this.initFill();

      // 创建时尝试一次异步获取和一次异步填充
      var me = this;
      setTimeout(function(){
        me.qualification = {};
        var qualification = as.schema.getInitData('qualification');
        as.util.flattening('qualification', qualification, me.qualification);

        var updateAsync = me.findAsync(REFRESHQUALIFICATION);
        if(updateAsync){
          updateAsync.check();
        }
        var fillAsync = me.findAsync(FILLQUALIFICATION);
        if(fillAsync){
          fillAsync.check();
        }
      }, 25);
    },

    findAsync: function(actionName){
      if(_.isString(actionName)){
        actionName = actionName.toLowerCase();
        return (_.find(this.queue, function(async){
          return (async.action() === actionName);
        }));
      }
    },

    removeAsync: function(actionName){
      if(_.isString(actionName)){
        var findIndex;
        actionName = actionName.toLowerCase();
        _.find(this.queue, function(async, index){
          if(async.action() === actionName){
            findIndex = index;
            return true;
          }
        });

        if(findIndex !== undefined){
          this.queue.splice(findIndex, 1);
        }
      }
    },

    initRefresh: function(){
      var async = this.findAsync(REFRESHQUALIFICATION);
      if(async){
        async.setCb(
          this.onRefreshQualification.bind(this)
          , this.onReplaceFillAsync.bind(this)
        );
      }
    },

    initFill: function(){
      var async = this.findAsync(FILLQUALIFICATION);
      if(async){
        async.setCb(this.onFillQualification.bind(this));
      }
    },

    onReplaceFillAsync: function(async){
      var newFillAsync;
      if(_.isObject(async) && async.action){
        var Async = asyncService.get(async.action);
        if(_.isFunction(Async)){
          newFillAsync = new Async({async: async});
        }
      }

      if(newFillAsync){ // 新异步合法时才替换旧异步
        var fillAsync = this.findAsync(FILLQUALIFICATION);
        if(fillAsync){
          fillAsync.setCb(undefined);
          fillAsync.destroy();
          this.removeAsync(FILLQUALIFICATION);
          delete fillAsync;
        }

        this.queue.push(newFillAsync);
        this.initFill();
      }
    },

    onRefreshQualification: function(data){
      var layoutModel = this.get('layoutModel');
      layoutModel.replaceChildren(data, this.qualification);
      this.qualification = undefined;
    },

    onFillQualification: function(kvs){
      _.each(kvs, function(obj){
        var field = as.schema.find(obj.id);
        if(field){
          field.setValue(obj.value);
          field.trigger('valueUpdated');
        }
      });
    }
  });

  module.exports = Model;
});