/**
 * 类目选择对话框
 */

/* jshint -W083 */

define(function(require, exports, module) {
    //
    var BaseDialog = require('src/base/common/dialog/dialog');
    var categoryTree = require('src/base/common/category/categoryTree');

    //
    var View = BaseDialog.extend({
        initialize: function() {
            this.zid = 'categoryTree';
            BaseDialog.prototype.initialize.apply(this, arguments);
            this.$panel.addClass('shop-cats-box clearfix');

            var me = this;
            $(window).resize(function() {
                me.onWindowResize();
            });
        },

        render: function() {
            var $panel = this.$panel;
            var me = this;
            $panel.empty();
            $panel.append(this.renderSearchInputs());
            $panel.append(this.renderSearchPath());
            $panel.append(this.renderCategroyTree());
            this.onWindowResize();

            //action
            $panel.on('keyup', '#searchBox', function() {
                var searchWord = this.value;

                if (this.timeId) {
                    clearTimeout(this.timeId);
                    this.timeId = null;
                }

                this.timeId = setTimeout(function() {
                    if (searchWord != null && searchWord.length != 0) {
                        me.searchNode(searchWord);
                    }
                }, 500)

            });
        },

        afterCreator: function() {
            this.on('preClick', this.prevNode, this);
            this.on('nextClick', this.nextNode, this);
            this.on('enterClick', this.enterNode, this);
        },


        prevNode: function() {
            var searchItems = this._Items;
            if (searchItems != null && searchItems.allItems.length != 0) {
                if (searchItems.index > 0) {
                    searchItems.index--;
                    var currentNode = searchItems.allItems[searchItems.index];
                    searchItems.currentItem = currentNode;
                    this.updateUi();
                    this.expandCurrentNode();
                }
            } else {
                //allItem
                var selectedNodes = this.tree.getSelectedNodes();
                if (selectedNodes.length > 0) {
                    var node = selectedNodes[0];
                    var nextNode = node.getPreNode();
                    if (nextNode != null) {
                        this.tree.selectNode(nextNode);
                    } else {
                        var parentNode = node.getParentNode();
                        if (parentNode != null) {
                            this.tree.selectNode(parentNode);
                        }
                    }
                }
            }
        },

        nextNode: function() {
            var searchItems = this._Items;
            if (searchItems != null && searchItems.allItems.length != 0) {
                if (searchItems.index < (searchItems.allItems.length - 1)) {
                    searchItems.index++;
                    var currentNode = searchItems.allItems[searchItems.index];
                    searchItems.currentItem = currentNode;
                    this.updateUi();
                    this.expandCurrentNode();
                }
            } else {
                //allItem
                var selectedNodes = this.tree.getSelectedNodes();
                if (selectedNodes.length > 0) {
                    var node = selectedNodes[0];
                    if (node.isParent && node.open) {
                        var childNodes = node.children;
                        this.tree.selectNode(childNodes[0]);
                    } else {
                        var nextNode = node.getNextNode();
                        if (nextNode == null) {
                            var parentNode = node.getParentNode();
                            if (parentNode != null) {
                                var uncleNode = parentNode.getNextNode();
                                this.tree.selectNode(uncleNode);
                            }
                        } else {
                            this.tree.selectNode(nextNode);
                        }
                    }
                }
            }
        },

        enterNode: function() {
            var selectedNodes = this.tree.getSelectedNodes();
            if (selectedNodes != null) {
                var node = selectedNodes[0];
                this.tree.expandNode(node, true, false, true);
            }
        },

        searchNode: function(searchWord) {
            if (searchWord.length != 0) {
                var nodes = this.tree.getNodesByParamFuzzy("name", searchWord, null);
                var searchedChildNodes = [];
                for (var i = 0; i < nodes.length; i++) {
                    var node = nodes[i];
                    if (node.children == null) {
                        searchedChildNodes.push(node);
                    }
                }

                var searchItems = {};
                searchItems.allItems = searchedChildNodes;
                searchItems.index = 0;
                if (searchedChildNodes.length != 0) {
                    searchItems.currentItem = searchedChildNodes[searchItems.index];
                } else {
                    searchItems.currentItem = null;
                }
                this._Items = searchItems;
                //udpateUI
                this.updateSearchResult();
            } else {
                var nodes = this.tree.getNodesByParam("isHidden", true);
                this.tree.showNodes(nodes);
                this.tree.expandAll(false);
            }
        },

        //界面搭建
        //search
        renderSearchInputs: function() {
            var _this = this;
            var $ui = $('<div>');
            var $bar = $('<div>').appendTo($ui);
            $bar.append($('<input type="text" id="searchBox" value="" style="" >'));
            $bar.append($('<input type="text" id="searchInfo" value="" style="" >'));
            $bar.append($('<button  id="prev" title="上一条"></button>').text('<'));
            $bar.append($('<button  id="next" title="下一条"></button>').text('>'));
            $bar.append($('<button  id="clean" title="清空"></button>').text('X'));
            //$bar.append($('<button  id="search" title="高级搜索"></button>').text('高级搜索'));


            $bar.on('click', '#prev', function() {
                log('上一条');
                var searchItems = _this._Items;
                if (searchItems != null && searchItems.allItems.length != 0) {
                    searchItems.index--;
                    var currentNode = searchItems.allItems[searchItems.index];
                    searchItems.currentItem = currentNode;
                    _this.updateUi();
                }

                _this.expandCurrentNode();

            });

            $bar.on('click', '#next', function() {
                console.log("下一条");
                var searchItems = _this._Items;
                if (searchItems != null && searchItems.allItems.length != 0) {
                    searchItems.index++;
                    var currentNode = searchItems.allItems[searchItems.index];
                    searchItems.currentItem = currentNode;
                    _this.updateUi();
                }

                _this.expandCurrentNode();
            });

            $bar.on('click', '#clean', function() {
                console.log("清空");
                $("#searchBox").val('');
                $("#searchInfo").val('请输入类目关键字');
                $("#searchPath").val('');
                _this._Items = null;
                _this.searchNode("");
            });

            $bar.on('click', '#search', function() {
                console.log("高级搜索");
            });

            return $ui;
        },

        updateSearchResult: function() {
            if (!_.isObject(this.tree)) {
                return;
            }

            var searchNodes = this._Items;
            if (searchNodes != null) {
                //查找被搜索到的所有节点（包括父节点以及父节点的父节点）
                var searchedParentNodes = [];
                for (var i = 0; i < searchNodes.allItems.length; ++i) {
                    var node = searchNodes.allItems[i];
                    searchedParentNodes.push(node);
                    while (node.getParentNode()) {
                        node = node.getParentNode();
                        var hasContained = false;
                        for (var k = 0; k < searchedParentNodes.length; k++) {
                            if (searchedParentNodes[k].value == node.value) {
                                hasContained = true;
                            }
                        }
                        if (!hasContained)
                            searchedParentNodes.push(node);
                    }
                }

                //隐藏其他节点
                var allNodes = this.tree.getNodesByParamFuzzy("name", "", null)
                for (var k = 0; k < allNodes.length; ++k) {
                    var node = allNodes[k];
                    var bFinded = false;
                    for (var j = 0; j < searchedParentNodes.length; j++) {
                        var pNode = searchedParentNodes[j];
                        if (node.value == pNode.value) {
                            bFinded = true;
                        }
                    }
                    if (bFinded) {
                        this.tree.showNode(node);
                    } else {
                        this.tree.hideNode(node);
                    }
                }

                //默认选中第一个节点
                this.expandCurrentNode();


                //更新界面
                this.updateUi();
            }
        },

        updateUi: function() {
            var searchNodes = this._Items;
            if (searchNodes != null) {
                //update searchBox
                if (searchNodes.allItems.length == 0) {
                    $("#searchInfo").val("没有找到您要的类目");
                    $("#searchPath").val("");
                } else {
                    var msg = '第' + (searchNodes.index + 1) + '个,共' + searchNodes.allItems.length + '个';
                    $("#searchInfo").val(msg);
                }

                //更新按钮
                if (searchNodes.allItems.length == 0) {
                    $("#prev").attr("disabled", true);
                    $("#next").attr("disabled", true);
                } else if (searchNodes.index == 0) {
                    $("#prev").attr("disabled", true);
                    $("#next").attr("disabled", false);
                } else if (searchNodes.index == (searchNodes.allItems.length - 1)) {
                    $("#prev").attr("disabled", false);
                    $("#next").attr("disabled", true);
                } else {
                    $("#prev").attr("disabled", false);
                    $("#next").attr("disabled", false);
                }

                //更新路径
                if (searchNodes.currentItem != null) {
                    var cidNamePath = [];
                    var curNode = searchNodes.currentItem;
                    cidNamePath.push(curNode.name);
                    while (curNode.getParentNode()) {
                        curNode = curNode.getParentNode();
                        cidNamePath.push(curNode.name);
                    }
                    cidNamePath = cidNamePath.reverse();
                    var path = cidNamePath.join('>>');
                    $("#searchPath").val(path);
                }
            }
        },

        expandCurrentNode: function() {
            //展开当前节点
            var searchNodes = this._Items;
            if (searchNodes != null) {
                if (searchNodes.currentItem != null) {
                    var node = searchNodes.currentItem;
                    while (node.getParentNode()) {
                        node = node.getParentNode();
                    }
                    this.tree.expandNode(node, true);
                    this.tree.selectNode(searchNodes.currentItem);
                }
            }
        },

        //path
        renderSearchPath: function() {
            var $ui = $('<div>');
            var $bar = $('<div>').appendTo($ui);
            $bar.append($('<input type="text" id="searchPath"  value="" style="">'));
            return $ui;
        },

        //categoryTree
        renderCategroyTree: function() {
            var $ui = $('<div class="shop-cats float-left">');
            var $bar = $('<div class="shop-title-bar clearfix">').appendTo($ui);
            $bar.append($('<div class="shop-cats-title float-left">').text('类目树'));
            var $categoryTree = $('<div class="ztree">').attr('id', this.zid).appendTo($ui);
            $categoryTree.css('width', 360 + 'px');
            $categoryTree.css('height', 400 + 'px');
            $categoryTree.css('overflow-y', 'auto');
            $categoryTree.css('overflow-x', 'hidden');
            this.tree = categoryTree.create($categoryTree, this.model.field);
            this.tree.on('checkStatusChanged', this.refreshSelectedCategory, this);

            if (this.model.field.lastCid != null && this.model.field.lastCid != 0) {
                var currentNodes = this.tree.getNodesByParam("value", this.model.field.lastCid, null);
                if (currentNodes.length != null)
                    var node = currentNodes[0];
                while (node.getParentNode()) {
                    node = node.getParentNode();
                }
                this.tree.expandNode(node, true);
                this.tree.selectNode(currentNodes[0]);
            }
            return $ui;
        },

        refreshSelectedCategory: function() {
            var selectedNodes = this.tree.getSelectedNodes();
            if (selectedNodes != null) {
                var node = selectedNodes[0];
                var cidNamePath = [];
                cidNamePath.push(node.name);
                while (node.getParentNode()) {
                    node = node.getParentNode();
                    cidNamePath.push(node.name);
                }

                cidNamePath = cidNamePath.reverse();
                var path = cidNamePath.join('>>');
                $("#searchPath").val(path);
            }
        },

        // 获取当前选中的节点
        selectedNodeInfo: function() {
            var options = {};
            var selectedNodes = this.tree.getSelectedNodes();
            if (selectedNodes.length != 0) {
                options.cid = selectedNodes[0].value;
                options.title = selectedNodes[0].name;
            }
            return options;
        },

        windowSize: function() {
            return {
                width: document.documentElement.clientWidth,
                height: document.documentElement.clientHeight
            };
        },

        onWindowResize: function() {
            var MIN = 56;
            var MAX = 354;
            var OFFSET = 200;

            var windowHeight = as.util.windowSize().height;
            var maxHeight = windowHeight - OFFSET;
            if (maxHeight < MIN) {
                maxHeight = MIN;
            }
            if (maxHeight > MAX) {
                maxHeight = MAX;
            }

            $('.ztree', this.$panel).css('max-height', maxHeight + 'px');
            $('.cats-panel', this.$panel).css('max-height', maxHeight + 'px');
        }
    });

    //
    module.exports = View;
});
