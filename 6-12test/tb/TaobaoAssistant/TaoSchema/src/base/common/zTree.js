/**
 * zTree封装
 *
 * 以id索引zTree实例，可以存在多个实例
 * 保证每个id始终最多只能映射到一个实例
 * id和存在于ui元素上的id保持一致
 */

define(function(require, exports, module) {
    //
    var translateOption2Node = function(option, checkCb) {
        if (!_.isObject(option) || !_.isFunction(checkCb)) {
            return;
        }

        var node = {};
        node.name = option.text;
        node.value = option.value;
        node.checked = checkCb(option.value);
        if (_.isArray(option.options)) {
            node.children = translateOptions2Nodes(option.options, checkCb);
        }

        return node;
    };

    //
    var translateOptions2Nodes = function(options, checkCb) {
        if (!_.isArray(options) || !_.isFunction(checkCb)) {
            return;
        }

        var nodes = [];
        for (var i = 0; i < options.length; ++i) {
            var option = options[i];
            var node = translateOption2Node(option, checkCb);
            if (_.isObject(node)) {
                nodes.push(node);
            }
        }

        return nodes;
    };

    //
    var zTreeSetting = {
        view: {
            showLine: false,
            showIcon: false,
            expandSpeed: 'fast',
        },

        check: {
            enable: true,
            chkStyle: 'checkbox',
            autoCheckTrigger: true,
            chkboxType: { Y: 'ps', N: 'ps' },
        },

        callback: {
            onClick: function(event, treeId, treeNode, clickFlag) {
                log('onClick');
                for (var i = 0; i < arguments.length; ++i) {
                    log(arguments[i]);
                }
            },

            onCheck: function(event, treeId, treeNode) {
                var tree = $.fn.zTree.getZTreeObj(treeId);
                if (tree) {
                    tree.trigger('checkStatusChanged');
                }
            }
        }
    };

    // 创建zTree，维持一个单实例
    var shopCats;
    var createZTree = function($el, field) {
        var id = $el.attr('id');
        if (!_.isString(id) || id.length <= 0) {
            return;
        }

        $.fn.zTree.destroy(id);
        shopCats = undefined;
        checkStatusChangeHandle = undefined;
        if ($el.length !== 1 || !_.isObject(field)) {
            return;
        }

        shopCats = field;
        var values = shopCats.value();
        var options = shopCats.get('options');
        var nodes = translateOptions2Nodes(options, function(value) {
            if (_.isArray(values)) {
                return (values.indexOf(value) !== -1);
            } else {
                return false;
            }
        });

        var tree = $.fn.zTree.init($el, zTreeSetting, nodes);
        _.extend(tree, Backbone.Events);
        return tree;
    };

    var expand = function(id) {
        var zTree = $.fn.zTree.getZTreeObj(id);
        if (_.isObject(zTree)) {
            zTree.expandAll(true);
        }
    };

    var pack = function(id) {
        var zTree = $.fn.zTree.getZTreeObj(id);
        if (_.isObject(zTree)) {
            zTree.expandAll(false);
        }
    };

    var expandChecked = function(id) {
        var zTree = $.fn.zTree.getZTreeObj(id);
        if (!_.isObject(zTree)) {
            return;
        }

        // 展开
        var nodes = zTree.getCheckedNodes(true);
        for (var i = 0; i < nodes.length; ++i) {
            // 拿到该节点对应的根节点
            var node = nodes[i];
            while (node.getParentNode()) {
                node = node.getParentNode();
            }
            zTree.expandNode(node, true, true, true, true);
        }

        zTree.refresh();
    };

    // 创建一个新的tree实例
    exports.create = createZTree;

    // 展开
    exports.expand = expand;

    // 收起
    exports.pack = pack;

    // 展开选中项
    exports.expandChecked = expandChecked;

    // 当前选中项发生变化(便于外面更新) => 基于shopCats字段去做
});
