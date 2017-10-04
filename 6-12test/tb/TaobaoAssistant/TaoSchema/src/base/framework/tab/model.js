/**
 * tab控件
 * {items: []}
 * buffer = {} (id, Model)
 */

define(function(require, exports, module) {
    //
    var service = require('src/base/service');

    //
    var TabModel = Backbone.Model.extend({
        events: {
            'currentTabChanged': '当前页面切换',
            'tabItemInserted': '控件插入',
            'tabItemRemoved': '控件删除',
        },

        initialize: function() {
            var subTabs = [];
            var allSubTabs = {};

            var children = service.getChildren(this.id);
            var me = this;
            if (_.isArray(children)) {
                _.each(children, function(child) {
                    var id = child.id;
                    var title = 'default';
                    if (child.other && child.other.title) {
                        title = child.other.title;
                    }

                    var Model = child.model;
                    var subTab = new Model({ 'parent': me, 'id': id, 'title': title, 'order': child.order });
                    allSubTabs[id] = subTab;
                    subTabs.push(subTab);
                });
            }

            this.set({ 'subTabs': subTabs, 'allSubTabs': allSubTabs, 'current': 0 });
        },

        insertItem: function(id) {
            if (!id) {
                return;
            }

            var subTabs = this.get('subTabs');
            var subTab = _.find(subTabs, function(subTab) {
                return (id === subTab.get('id'));
            });

            if (subTab) { // 已经存在 
                return;
            }

            var allSubTabs = this.get('allSubTabs');
            if (allSubTabs[id]) {
                subTab = allSubTabs[id];
            } else {
                var subTabService = service.get(id);
                if (!subTabService) {
                    error('service is undefined >> ' + id);
                    return;
                }

                var Model = subTabService.model;
                if (!Model) {
                    error('service.model is undefined >> ', id);
                    return;
                }

                var title = 'default';
                if (subTabService.other && subTabService.other.title) {
                    title = subTabService.other.title;
                }

                subTab = new Model({ 'parent': this, 'id': id, 'title': title, 'order': subTabService.order });
                allSubTabs[id] = subTab;
            }

            {
                // insert
                subTabs.push(subTab);
                subTabs = _.sortBy(subTabs, function(subTab) {
                    return subTab.get('order');
                });

                this.set('subTabs', subTabs);
            }

            {
                // update current
                var index = this.getIndex(id);
                var current = this.get('current');
                if (index <= current) {
                    current += 1;
                    this.set('current', current);
                }
            }

            this.trigger('tabItemInserted', id);
        },

        removeItem: function(id) {
            var subTabs = this.get('subTabs');
            var findIndex;
            _.find(subTabs, function(subTab, index) {
                if (id === subTab.get('id')) {
                    findIndex = index;
                    return true;
                }
            });

            if (findIndex !== undefined) {
                subTabs.splice(findIndex, 1);

                {
                    // update current
                    var current = this.get('current');
                    if (findIndex <= current) {
                        current -= 1;
                        current = (current < 0 ? 0 : current);
                        this.set('current', current);
                    }
                }

                this.trigger('tabItemRemoved', id);
            }
        },

        setCurrent: function(id) {
            var subTabs = this.get('subTabs');
            var findIndex;
            var subTab = _.find(subTabs, function(subTab, index) {
                if (id === subTab.get('id')) {
                    findIndex = index;
                    return true;
                }
            });

            var current = this.get('current');
            if (findIndex !== undefined && current !== findIndex) {
                this.set({ 'current': findIndex });
                this.trigger('currentTabChanged', findIndex, current);
            }
        },

        getIndex: function(id) {
            var subTabs = this.get('subTabs');
            var findIndex;
            _.find(subTabs, function(subTab, index) {
                if (subTab.get('id') === id) {
                    findIndex = index;
                    return true;
                }
            });

            return findIndex;
        },

        getSubModel: function(id) {
            var subTabs = this.get('subTabs');
            var subTab = _.find(subTabs, function(subTab, index) {
                if (subTab.get('id') === id) {
                    findIndex = index;
                    return true;
                }
            });

            return subTab;
        },

        getTip: function() {
            return '快捷键F1放大/还原编辑区；F2显示/隐藏当前项提示';
        }
    });

    //
    module.exports = TabModel;
});
