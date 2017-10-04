/**
 * 
 */

define(function(require, exports, module){
    //
    var schema = require('src/schema/schema');
    var sdk = require('src/schema/ui/biz/deliver/etc/etc-sdk-qn');

    //
    var DAILY_URL = 'http://tms-preview.taobao.com/wh/tms/taobao/page/markets/myseller/etc?env=daily';
    var ONLINE_URL = 'http://www.taobao.com/markets/myseller/etc';
    var ETC_ERROR_ID = 'etc-error';
    var ETC_ERROR = '电子凭证组件存在错误，请修改';

    //
    var View = Backbone.View.extend({
        tagName:'div',
        className: 'etc',

        initialize: function(){
            // 初始化
            sdk.init(this.el);

            var me = this;
            schema.registerBeforeSaveHandler(function(notifyFinishedCb){
                if(me.$el.is(':visible') && me.field){
                    sdk.fetch(function(etcData){
                        if(!_.isEmpty(etcData)){
                            me.field.setValue(etcData);
                        }else{
                            me.field.setValue(undefined);
                        }

                        if(typeof notifyFinishedCb === 'function'){
                            notifyFinishedCb();
                        }
                    });
                }else{
                    if(typeof notifyFinishedCb === 'function'){
                        notifyFinishedCb();
                    }
                }
            });
        },

        setField: function(field){
            this.field = field;
            this.field.on('valueChanged', this.onValidate, this);
        },

        detach: function(){
            this.$el.detach();
            this.field = null;
        },

        render: function(){
            // 重置
            sdk.resetReady(false);

            // 对象类型
            var etcData = this.field.value();
            log('etcData', etcData);
            if(!_.isObject(etcData)){
                etcData = {};
            }

            // fix 和etc组件约定，如果传空字符串，则以线上数据为准
            if(_.isEmpty(etcData)){
                etcData = '';
            }

            sdk.update(as.entity.categoryId(), as.entity.itemId(), as.daily? 'daily': 'online', etcData);
        },

        // 异步验证
        onValidate: function(isValidate){
            if(!isValidate){
                return;
            }

            var me = this;
            sdk.validate(function(isValidateOk){
                if(isValidateOk){
                    me.field.removeRuleError(ETC_ERROR_ID);
                }else{
                    me.field.addRuleError(ETC_ERROR_ID, ETC_ERROR);
                }
            });
        },

        isReady: function(){
            return sdk.isReady();
        },

        getHeight: function(){
            sdk.getHeight();
        }
    });

    // 
    module.exports = new View({});
});