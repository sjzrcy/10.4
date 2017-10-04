/**
 * 
 */

define(function(require, exports, module) {
    //
    var schema = require('src/schema/schema');

    //
    var etcErrorCount = 0;
    var ETC_ERROR_ID = 'etc-error';
    var ETC_ERROR = '电子凭证组件存在错误，请修改';

    //
    var View = Backbone.View.extend({
        tagName: 'div',
        className: 'etc',

        initialize: function() {
            // 是否已经加载js
            this.loaded = false;

            // 初始化
            this.$el.attr('id', 'J-ma-iframe-wrap')
                .attr('data-from', 'as');

            var me = this;
            schema.registerBeforeSaveHandler(function(notifyFinishedCb) {
                if (window.MaIframe && me.$el.is(':visible') && me.field) {
                    var etcData = MaIframe.getData();
                    log('before save >>', 'etc', etcData);

                    if (!_.isEmpty(etcData)) {
                        me.field.setValue(etcData);
                    } else {
                        me.field.setValue(undefined);
                    }
                }

                if (_.isFunction(notifyFinishedCb)) {
                    notifyFinishedCb();
                }
            });
        },

        setField: function(field) {
            this.field = field;
            this.field.on('valueChanged', this.onValidate, this);
        },

        detach: function() {
            this.$el.detach();
            this.field = null;
        },

        render: function() {
            // 更新类目id
            this.$el.attr('data-env', as.daily ? 'daily' : 'online');
            this.$el.attr('data-category-id', as.entity.categoryId());
            this.$el.attr('data-item-id', as.entity.itemId());


            // 避免内部出现死循环，避免对服务器形成高压攻击
            this.retryCount = 0;

            // 渲染etc
            var me = this;
            var renderETC = function() {
                try {
                    if (window.MaIframe && MaIframe.ReRenderAs) {
                        // 如果正常渲染了，则将错误计数重置
                        etcErrorCount = 0;

                        var etcData = me.field.value();
                        log('etcData', etcData);
                        if (!_.isObject(etcData)) {
                            etcData = {};
                        }

                        // fix 和etc组件约定，如果传空字符串，则以线上数据为准
                        if (_.isEmpty(etcData)) {
                            etcData = '';
                        }

                        MaIframe.ReRenderAs(etcData, me.el);
                    } else {
                        if (me.retryCount < 3) {
                            setTimeout(function() {
                                renderETC();
                            }, 1000);

                            me.retryCount += 1;
                        }
                    }
                } catch (e) {
                    error('etc组件渲染出现异常，请尽快定位原因@艮离@倾程');
                    me.$el.text('系统异常，麻烦重试');
                }
            };

            // 动态获取ETC组件
            if (!this.loaded) {
                $.getScript((as.daily ? as.etcDailyJS : as.etcOnlineJS), function(response, status) {
                    if ('success' === status) {
                        me.loaded = true;
                    }
                    renderETC();
                });
            } else {
                renderETC();
            }
        },

        isReady: function() {
            return (this.$el.html() !== '');
        },

        isValidate: function() {
            if (window.MaIframe && MaIframe.isAsChecked) {
                return MaIframe.isAsChecked();
            } else {
                return true;
            }
        },

        onValidate: function(isValidate) {
            if (!isValidate) {
                return;
            }

            if (this.isValidate()) {
                this.field.removeRuleError(ETC_ERROR_ID);
            } else {
                this.field.addRuleError(ETC_ERROR_ID, ETC_ERROR);
            }
        }
    });

    // 电子交易凭证组件异常，重新渲染该组件
    window.etcError = function(errorCode) {
        error('etc', errorCode);
        etcErrorCount += 1;
        if (etcErrorCount < 3) {
            setTimeout(function() {
                as.etc.render();
            }, 800);
        }
    };

    // 
    module.exports = new View({});
});
