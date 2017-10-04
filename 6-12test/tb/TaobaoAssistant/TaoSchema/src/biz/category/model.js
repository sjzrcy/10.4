/**
 * 类目选择 - model
 * 
 * categorys [], 最近使用的类目，这部分考虑序列化 {cid, title}
 * getTitle, 从后端获取cid对应的title
 * setCategory, 设置当前类目
 *
 */

define(function(require, exports, module) {
    //
    var CategoryModel = Backbone.Model.extend({
        events: {
            cidChanged: undefined, // 重置类目
        },

        initialize: function() {
            this.set('options', []);
            this.set('must', true);
            this.set('inputable', false);
            this.set('readonly', false);
            this.set('unit', '最近使用');
            this.set('title', '类目');
            this.MAX = 20;

            this.retryCount = 0;
            this.MAX_RETRY_COUNT = 100;

            // 获取本地最近使用的类目
            var me = this;
            as.shell.getRecentUsedCategory(function(jsonStr) {
                var resents;
                try {
                    resents = JSON.parse(jsonStr);
                } catch (e) {
                    warn('非法JSON：最近使用的类目列表');
                    return;
                }

                // value, text
                if (!_.isArray(resents)) {
                    return;
                }

                // 合并
                var options = me.get('options');
                _.each(resents, function(option) { // 对历史数据做验证
                    if (option.value && option.text && !me.checkRecentRecord(option.value)) {
                        options.push(option);
                    }
                });
            });
        },

        // 来自交互的setValue
        setValue: function(cid) {
            var lastValue = this.value();
            if (cid !== lastValue) {
                this.set('value', cid);
                this.trigger('cidChanged');

                warn('cid', cid);
                as.entity.changeCategory(cid);
            }
        },

        value: function() {
            return this.get('value');
        },

        checkRecentRecord: function(cid) {
            var options = this.get('options');
            var findIndex;
            _.find(options, function(option, index) {
                if (String(option.value) === String(cid)) {
                    findIndex = index;
                    return true;
                }
            });
            if (!_.isUndefined(findIndex)) {
                options.splice(findIndex, 1);
            }

            return false;
        },

        addRecentRecord: function(cid, title) {
            if (!cid || !title) {
                return;
            }

            if (!this.checkRecentRecord(cid)) {
                var options = this.get('options');
                //插入数组头部,且删除多余最大数量的队尾个数
                options.splice(0, 0, { 'value': cid, 'text': title });
                for (var i = options.length - 1; i >= this.MAX; --i) {
                    options.pop();
                }

                // 数据更新时，自动持久化
                as.shell.setRecentUsedCategory(options);
            } else {
                warn('addRecentRecord >> 重复添加cid >> ' + cid);
            }
        },

        // 来自切换商品
        setCid: function(cid) {
            // 重置重试条件
            this.retryCount = 0;

            var lastValue = this.value();
            if (cid === '0') { // 如果是0就是清空类目选项
                this.set('value', cid);
                this.trigger('cidChanged');
                return;
            }

            if (this.checkRecentRecord(cid)) {
                this.set('value', cid);
                this.trigger('cidChanged');
            } else {
                var me = this;
                as.shell.getCategoryName(cid, function(title) {
                    me.addRecentRecord(cid, title);
                    me.set('value', cid);
                    me.trigger('cidChanged');

                    if (cid && !title) {
                        setTimeout(function() {
                            me.retry();
                        }, 1000);
                    }
                });
            }
        },

        retry: function() {
            // 重试终止条件
            this.retryCount += 1;
            if (this.retryCount > this.MAX_RETRY_COUNT) {
                return;
            }

            var me = this;
            var cid = this.value();
            as.shell.getCategoryName(cid, function(title) {
                me.addRecentRecord(cid, title);
                if (cid && cid !== '0' && !title) {
                    setTimeout(function() {
                        me.retry();
                    }, 1000);
                } else {
                    me.trigger('cidChanged');
                }
            });
        },

        isReadonly: function() {
            return this.get('readonly');
        }
    });

    //
    module.exports = CategoryModel;
});
