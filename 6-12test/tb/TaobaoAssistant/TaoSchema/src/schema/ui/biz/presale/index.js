/*
 *
 */
define(function(require, exports, module){
    //
    var translate = require('src/base/shell/translate');
    var BaseView = require('src/schema/baseview');
    var presale = require('src/schema/ui/biz/presale/presale');
    var TopSchemaView = require('src/schema/ui/base/schematop');
    var iframe = document.createElement('iframe');

    //
    module.exports = BaseView.extend({
        tagName: 'div',
        className: 'schema',

        initialize: function(){
            // 继承schema行为
            BaseView.prototype.initialize.apply(this, arguments);
            
            this.save();
            this.watch();

            this.top = new TopSchemaView({model: this.model});
        },

        save: function(){
            var me = this;
            var beforeSaveHandle = function(notifyFinishedCb){
                var isFinished = false;
                presale.get(function(data){
                    isFinished = true;
                    me.model.setValue(data);
                    notifyFinishedCb();
                });

                setTimeout(function(){
                    // 在其没有正常返回时
                    if(!isFinished){
                        isFinished = true;
                        error('预售组件保存流程没有正常返回，超时1000ms');
                        notifyFinishedCb();
                    }
                }, 1000);
            }
            
            // 注册
            as.schema.registerBeforeSaveHandler(beforeSaveHandle);

            // 重新渲染时，清除回调
            as.schema.on('schemaChanged', function(){
                as.schema.unregisterBeforeSaveHandler(beforeSaveHandle);
            });
        },

        watch: function(){
            var watch = this.model.get('watch');
            if(_.isArray(watch) && watch.length > 0){
                var me = this;
                _.each(watch, function(id){
                    var field = as.schema.find(id);
                    if(field){
                        field.on('valueChanged', function(){
                            me.onValueChanged(id, field.value());
                        });
                    }
                });
            }
        },

        getUrl: function(){
            var url = this.model.get('url');
            return url;
        },

        render: function(){
            this.$el.empty();
            this.top.render();
            this.$el.append(this.top.$el);
            
            var me = this;
            as.shell.getAutoLoginUrl(encodeURIComponent(this.getUrl()), function(jsonstr){
                var url = as.util.fetchUrl(jsonstr);
                if(!url){
                    as.util.showErrorTip('获取自动登录的url失败，预售组件');
                    return;
                }

                me.initComponent(url);
            });
        },

        initComponent: function(url){
            presale.init({
                container: this.el,
                iframe: iframe,
                url: url
            });

            var me = this;
            presale.on('load', function(){
                var config = {};
                config.cateId = as.entity.categoryId();
                config.bizCode = me.model.get('bizCode');
                config.data = me.model.value();

                if(as.entity.itemId()){
                    config.itemId = as.entity.itemId();
                }
                if(as.daily){
                    config.isDaily = true;
                }

                // 设置初始值
                presale.set(config);
            });

            presale.on('open', function(data){
                if(_.isObject(data) && data.url){
                    as.shell.openUrl(data.url, !!data.autoLogin);
                }
            });
        },

        onValueChanged: function(id, value){
            var data = {};
            data[id] = value;
            presale.update(data);
        }
    });
});