/**
 * 
 */

define(function(require, exports, module) {
    // 函数转换服务
    var translate = require('src/base/shell/translate');

    //
    var DAILY_URL = 'http://tms-preview.taobao.com/wh/tms/taobao/page/markets/myseller/etc?env=daily';
    var ONLINE_URL = 'http://www.taobao.com/markets/myseller/etc';
    var ETC_ERROR_ID = 'etc-error';
    var ETC_ERROR = '电子凭证组件存在错误，请修改';
    var SENDER = 'etc';

    // iframe & container
    var iframe = document.createElement('iframe');
    window.etcIframe = iframe;
    var container = undefined;

    // status
    var isIframeLoaded = false;
    var lastCb;

    // 过滤消息
    var filterMessage = function(router) {
        if (typeof router === 'object') {
            return (router.sender === SENDER && router.signal && (typeof router.signal === 'string'));
        }
    };

    // 消息处理
    var handlerSet = {};
    var registerHandler = function(signal, handler) {
        if (signal && typeof signal === 'string' && typeof handler === 'function') {
            signal = signal.trim();
            signal = signal.toLowerCase();
            if (!handlerSet[signal]) {
                handlerSet[signal] = handler;
            }
        }
    };

    var getHandler = function(signal) {
        if (signal && typeof signal === 'string') {
            signal = signal.trim();
            signal = signal.toLowerCase();
            return handlerSet[signal];
        }
    };

    // etc消息入口
    var listen = function() {
        window.addEventListener('message', function(e) {
            var config;
            try {
                config = JSON.parse(e.data);
            } catch (e) {
                config = {};
            }

            var router = config.router;
            if (!filterMessage(config.router)) {
                // 高度计算
                if (config.isMa && config.height) {
                    config.router = {
                        sender: SENDER,
                        signal: 'updateHeight'
                    };
                    config.params = config.height;
                } else {
                    return;
                }
            }

            // 消息处理
            var handler = getHandler(config.router.signal);
            if (typeof handler === 'function') {
                handler(config.params);
            }
        });
    };

    // 向etc发送消息
    var send = function(signal, params) {
        var data = {
            router: {
                sender: 'as',
                signal: signal
            },
            params: params
        };

        var payload = JSON.stringify(data);
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage(payload, '*');
        } else {
            error('向iframe[etc]发送消息失败');
        }
    };

    var EtcIndex = Backbone.Model.extend({
        initialize: function() {
            var $iframe = $(iframe).css({
                width: '100%',
                border: 'none',
                height: '30px' //'450px'
            });

            // 登录url
            pageReady(function() {
                as.shell.getAutoLoginUrl(encodeURIComponent(as.daily ? DAILY_URL : ONLINE_URL), function(jsonstr) {
                    var url = as.util.fetchUrl(jsonstr);
                    if (url) {
                        $iframe.attr('src', url);
                    } else {
                        error('登录失败：', DAILY_URL);
                    }
                });
            });

            registerHandler('pageLoad', this.onPageLoad.bind(this));
            registerHandler('updateHeight', this.onHeightUpdate.bind(this));
            registerHandler('callback', this.onCallback.bind(this));
            registerHandler('openUrl', this.onOpenUrl.bind(this));
            registerHandler('error', this.onError.bind(this));

            // 监听
            listen();
        },

        // 设置组件容器
        init: function(domContainer) {
            container = domContainer;
            $(container).append($(iframe));
        },

        isReady: function() {
            return isIframeLoaded;
        },

        resetReady: function() {
            isIframeLoaded = false;
        },

        onPageLoad: function() {
            isIframeLoaded = true;
            if (typeof lastCb === 'function') {
                lastCb();
                lastCb = undefined;
            }
        },

        onHeightUpdate: function(height) {
            if (iframe) {
                $(iframe).css('height', height + 'px');
            }
        },

        onCallback: function(params) {
            if (typeof params === 'object') {
                var callback = params.callback;
                if (typeof window[callback] === 'function') {
                    window[callback](params.params);
                }
            }
        },

        onOpenUrl: function(params) {
            if (params.url) {
                as.shell.openUrl(params.url, params.login);
            }
        },

        onError: function(message) {
            alert(message);
        },

        update: function(categoryId, itemId, env, data) {
            // dom没有被加到body里面时，无法发送消息
            if (isIframeLoaded) {
                send('update', {
                    categoryId: categoryId,
                    itemId: itemId,
                    env: env,
                    data: data
                });
            } else {
                lastCb = function() {
                    send('update', {
                        categoryId: categoryId,
                        itemId: itemId,
                        env: env,
                        data: data
                    });
                }
            }
        },

        fetch: function(cb) {
            var cbId = translate(cb);
            send('fetch', { callback: cbId });
        },

        validate: function(cb) {
            var cbId = translate(cb);
            send('validate', { callback: cbId });
        },

        getHeight: function() {
            send('getHeight');
        },
    });

    module.exports = new EtcIndex({});
});
