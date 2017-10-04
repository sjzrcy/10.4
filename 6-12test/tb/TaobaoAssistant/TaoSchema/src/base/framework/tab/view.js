/**
 * tab控件
 */

define(function(require, exports, module) {
    //
    var service = require('src/base/service');
    var TabItemView = require('src/base/framework/tab/item/view');

    //
    module.exports = Backbone.View.extend({
        tagName: "div",
        className: "tab",

        initialize: function() {
            this.model.on('currentTabChanged', this.onCurrentTabChanged, this);
            this.model.on('tabItemInserted', this.onTabItemInserted, this);
            this.model.on('tabItemRemoved', this.onTabItemRemoved, this);

            var tabs = [];
            var allTabs = {};
            _.each(this.model.get('subTabs'), function(subTabModel) {
                var id = subTabModel.get('id');
                var View = service.getView(id);
                if (!View) {
                    View = TabItemView;
                }

                var tab = new View({ model: subTabModel });
                tabs.push(tab);
                allTabs[id] = tab;
            });

            this.tabs = tabs;
            this.allTabs = allTabs;
        },

        render: function() {
            var $el = this.$el;
            if (this.$el.html().length === 0) {
                $el.html('<div class="panel"></div><div class="bar"></div>');
            }

            this.detach();
            this.attach();

            // 在编辑区时，更新提示
            var me = this;
            as.shell.isInEdit(function(str) {
                var obj;
                try {
                    obj = JSON.parse(str);
                } catch (e) {
                    obj = { isInEdit: false };
                }

                if (obj.isInEdit) {
                    me.addTip(me.model.getTip());
                } else {
                    me.addTip('快捷键F2显示/隐藏当前项提示');
                }
            });
        },

        detach: function() {
            _.each(this.tabs, function(tab, index) {
                tab.$tab.detach();
                tab.$panel.detach();
            });
        },

        attach: function() {
            var current = this.model.get('current');
            var $bar = $('.bar', this.$el);
            var $panel = $('.panel', this.$el);

            _.each(this.tabs, function(tab, index) {
                $bar.append(tab.$tab);
                $panel.append(tab.$panel);
                if (current === index) {
                    tab.active();
                }
            });
        },

        addTip: function(tip) {
            if (!tip) {
                return;
            }

            var $tip = $('<div>').addClass('tip').text(tip);
            var $bar = $('.bar', this.$el);
            $bar.append($tip);
        },

        onCurrentTabChanged: function(current, last) {
            this.tabs[last].deactive();
            this.tabs[current].active();
        },

        onTabItemInserted: function(id) {
            var tabView = this.allTabs[id];
            if (!tabView) {
                var View = service.getView(id);
                var subModel = this.model.getSubModel(id);
                if (!View || !subModel) {
                    error('service or model error >> ' + id);
                    return;
                }

                tabView = new View({ 'model': subModel });
                this.allTabs[id] = tabView;
            }

            {
                // insert
                this.tabs.push(tabView);
                this.tabs = _.sortBy(this.tabs, function(view) {
                    return view.model.get('order');
                });
            }

            // 重新渲染
            this.render();
        },

        onTabItemRemoved: function(id) {
            var findIndex;
            var tabView = _.find(this.tabs, function(tab, i) {
                if (id === tab.id()) {
                    findIndex = i;
                    return true;
                }
            });

            if (tabView) {
                this.tabs.splice(findIndex, 1);

                // 从bar和panel中移除
                tabView.deactive();
                tabView.$tab.detach();
                tabView.$panel.detach();

                // 重新渲染
                this.render();
            } else {
                error('TabView和TabModel数据不一致！ >> onTabItemRemoved:' + id + ', ' + index);
            }
        }
    });

    //
});
