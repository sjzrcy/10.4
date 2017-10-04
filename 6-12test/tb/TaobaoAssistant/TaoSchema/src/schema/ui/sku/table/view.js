/**
 * 
 */

define(function(require, exports, module) {
    //
    var SchemaTop = require('src/schema/ui/base/schematop');
    var SchemaBottom = require('src/schema/ui/base/schemabottom');
    var InputsView = require('src/schema/ui/sku/inputs/view');
    var adjuster = require('src/base/datatype-adjuster');
    var BaseView = require('src/schema/baseview');
    var sid = 'skuId';
    //
    var View = BaseView.extend({
        tagName: 'div',
        className: 'sku-body schema float-left',

        events: {
            'blur table tr td input': function() {
                var $input = $(event.srcElement);
                var value = as.util.trimedValue($input);
                var last = $input.attr('last');
                if (last !== value) {
                    $input.attr('last', value);
                    this.updateTr($input.parent().parent());

                    // 外层触发信号
                    var table = this.model.get('table');
                    table.trigger('valueChanged');
                }
            },

            'click table': function() {
                var metas = this.model.get('metas');
                if (!metas.hasCompletedGroup() && !this.twinkle) {
                    this.twinkle = true;
                    var $el = this.$('.tip-td');
                    var PER = 200;
                    var count = 3;
                    for (var i = 0; i < count; ++i) {
                        setTimeout(function() {
                            $el.css({ 'color': '#ffffff' });
                        }, (2 * i) * PER);

                        setTimeout(function() {
                            $el.css({ 'color': '#ff9900' });
                        }, (2 * i + 1) * PER);
                    }

                    var me = this;
                    setTimeout(function() {
                        me.twinkle = false;
                        $el.css({ 'color': '#666666' }, 100);
                    }, 2 * PER * count);
                }
            }
        },

        initialize: function() {
            // 继承自baseview
            BaseView.prototype.initialize.apply(this, arguments);
            var me = this;
            this.model.setActive = function() {
                var table = me.model.get('table');
                table.setActive(this.$table);
            };

            // 不管sku是否完整，都发送该消息
            this.model.on('skuMetaChanged', this.render, this);

            // title
            var table = this.model.get('table');
            var topView = new SchemaTop({ model: table });
            topView.render();
            this.$el.append(topView.$el);

            // inputs
            this.inputs = new InputsView({ model: this.model.get('inputs') });
            this.inputs.on('fill', this.onInputsFill, this);
            this.inputs.render();
            this.$el.append(this.inputs.$el);

            // table heads
            this.$table = $('<table>');
            this.$el.append(this.$table);

            this.$heads = $('<tr tag="head">');
            this.$table.append(this.$heads);
            this.updateHeaders();

            // bottom
            var bottomView = new SchemaBottom({ model: table });
            bottomView.render();
            this.$el.append(bottomView.$el);
        },

        // 表格主体
        render: function() {
            var metas = this.model.get('metas');
            if (metas.hasCompletedGroup()) {
                this.renderTable();
            } else {
                this.renderTip();
            }

            // 外层触发信号
            var table = this.model.get('table');
            table.trigger('valueChanged');
        },

        // 表头可能发生变化，渲染前更新一下
        // 没有完整数据时，只渲染必选
        updateHeaders: function() {
            this.$heads.empty();

            var table = this.model.get('table');
            var headers = table.get('headers');
            var count = 0;

            var me = this;
            _.each(table.get('headers'), function(header, index, list) {
                // 默认显示表头，只有显式不展示时，才不渲染
                if (header.show === false) {
                    return;
                }

                count += 1;
                var $header = $('<th>').attr('for', header.id);
                if (header.must) {
                    $header.append($('<span class="must">*</span>'));
                }

                $header.append($('<span>').html(header.title));
                me.$heads.append($header);
            });

            // 校准宽度
            $('th', this.$heads).css('width', 'calc(100% / ' + count + ')');

            // tip 简单处理，重新赋值
            this.$tip = $('<tr class="tip-row"><td class="tip-td" colspan="' + count + '">test</td></tr>');
        },

        renderTable: function() {
            this.inputs.show();
            this.$tip.detach();
            $('tr[tag=sku]', this.$table).remove();

            // render sku data
            // 1.排列组合，更新表头
            var skuItems = this.calcSkuItems();
            this.updateHeaders();

            var inputs = this.model.get('inputs').children();
            var isInputId = function(id) {
                var isInput = false;
                _.find(inputs, function(input) {
                    if (input.id === id) {
                        isInput = true;
                        return true;
                    }
                });

                return isInput;
            };

            // 2.渲染表格
            // 2.1 metas
            // 2.2 inputs
            // 2.3 从data中获取数据，进行input数据填充
            var me = this;
            var skus = []; // 总数据
            _.each(skuItems, function(skuItem) {
                //渲染一行
                var $tr = $('<tr tag="sku">');
                me.$table.append($tr);

                // metas
                var query = {};
                _.each(skuItem, function(metaValueItem) {
                    query[metaValueItem.id] = { 'value': metaValueItem.value, 'text': metaValueItem.text };
                    var $td = $('<td>').attr('tag', 'meta')
                        .attr('for', metaValueItem.id)
                        .data('value', metaValueItem.value)
                        .text(metaValueItem.text);
                    $tr.append($td);
                });

                // 新数据将会替换掉旧的数据
                var rowItem = me.findSku(query);
                if (!rowItem) {
                    rowItem = _.extend({}, query);
                    rowItem[sid] = ('tbas-' + as.shell.createUUID());
                } else {
                    // 任意一条sku的数据，由inputs + 实时计算出的metas组成
                    var inputDatas = _.pick(rowItem, function(value, id) {
                        return isInputId(id);
                    });

                    rowItem = _.extend(inputDatas, query);
                    if (!rowItem[sid] || rowItem[sid] === '0') { // 如果原来的数据不包含skuid，自动加上去
                        rowItem[sid] = ('tbas-' + as.shell.createUUID());
                    }
                }

                _.each(inputs, function(input) {
                    var id = input.id;
                    var value = rowItem[input.id] ? rowItem[input.id] : '';

                    var $input = $('<input>').attr('last', value).val(value);
                    var $td = $('<td>').attr('tag', 'input')
                        .attr('for', id)
                        .append($input);
                    $tr.append($td);
                });

                // 新数据将会替换掉旧的数据
                $tr.attr(sid, rowItem[sid]);
                skus.push(rowItem);
            });

            // 全量更新sku数据
            var table = this.model.get('table');
            table.setValue(skus);

            // 合并表格
            as.util.mergeTd(this.$table, this.model.get('metas').children().length);
        },

        renderTip: function() {
            // 删除原有tr和清空sku
            $('tr[tag=sku]', this.$table).remove();
            var table = this.model.get('table');
            table.setValue([]);

            // 批量入口禁用，提示信息展示
            this.inputs.hide();
            $('td', this.$tip).text(this.tip());
            this.$table.append(this.$tip);
        },

        tip: function() {
            var tip = '请选择右侧的';
            var metas = this.model.get('metas');
            var titles = metas.getTitleOfEmptyMeta();
            tip += titles.join('、');
            tip += '——>';
            return tip;
        },

        getSkuMetas: function() {
            //option{ id:, value:'', text:''}
            var headers = this.model.get('table').get('headers');
            var metas = this.model.get('metas').children();

            var skuMetas = [];
            _.each(headers, function(header) {
                var meta = _.find(metas, function(meta) {
                    return (meta.id === header.id);
                });

                if (meta) {
                    var values = meta.value();
                    var skuMeta = [];
                    _.each(values, function(option) {
                        if (!_.isObject(option)) {
                            return;
                        }

                        // 兼容处理：从后端来的option，可能text为空，对标准option做兼容处理
                        if (!option.text) {
                            option.text = meta.findOptionText(option.value);
                        }

                        // 组装出sku里面option的模型
                        skuMeta.push({ 'id': meta.id, 'value': option.value, 'text': option.text });
                    });
                    if (skuMeta.length > 0) {
                        header.show = true;
                        skuMetas.push(skuMeta);
                    } else {
                        header.show = false;
                    }
                }
            });

            return skuMetas;
        },

        calcSkuItems: function() {
            var skuMetas = this.getSkuMetas();
            var items = [];

            var calc = function(skuItem, currentIndex) {
                if (currentIndex < 0 || currentIndex >= skuMetas.length) {
                    return;
                }

                var skuMeta = skuMetas[currentIndex];
                for (var index = 0; index < skuMeta.length; ++index) {
                    var item = [];
                    for (var i = 0; i < skuItem.length; ++i) {
                        item[i] = skuItem[i];
                    }

                    item.push(skuMeta[index]);
                    if (currentIndex === skuMetas.length - 1) {
                        items.push(item);
                    } else {
                        arguments.callee(item, currentIndex + 1);
                    }
                }
            };

            calc([], 0);
            var innerTrace = function() {
                for (var i = 0; i < items.length; ++i) {
                    var item = items[i];
                    var str = "";
                    for (var j = 0; j < item.length; ++j) {
                        str += "(" + item[j].text + "," + item[j].value + ")";
                    }
                    log(str);
                }
            };
            innerTrace();

            return items;
        },

        updateTr: function($tr, id) {
            var skuid = $tr.attr(sid);
            var table = this.model.get('table');

            var skus = table.value();
            var sku = _.find(skus, function(sku) {
                return (sku[sid] === skuid);
            });

            if (sku) {
                $('td[tag=input]', $tr).each(function() {
                    var $td = $(this);
                    sku[$td.attr('for')] = $('input', $td).val();
                });

                adjuster.adjustObject(sku, this.model.dataTypes());
            }
        },

        findSku: function(query) {
            // 判断值是否相等，若为对象比较，只比较value属性
            var _isEqual = function(value0, value1) {
                if (_.isObject(value0) && _.isObject(value1)) {
                    return value0.value === value1.value;
                }
                return _.isEqual(value0, value1);
            };

            var table = this.model.get('table');
            var skus = table.value();

            var matchSku;
            _.find(skus, function(sku) {
                var isEqual = true;
                _.each(query, function(value, id) {
                    if (!_isEqual(value, sku[id])) {
                        isEqual = false;
                        return true;
                    }
                });

                if (isEqual) {
                    matchSku = sku;
                    return true;
                }
            });

            return matchSku;
        },

        onInputsFill: function(fill) {
            var me = this;
            _.each(fill, function(value, id) {
                $('td[for=' + id + '] input', me.$table).each(function() {
                    var $input = $(this);
                    $input.data('last', value).val(value);
                });
            });

            $('tr[tag=sku]', this.$table).each(function() {
                var $tr = $(this);
                me.updateTr($tr);
            });

            // 外层触发信号
            var table = this.model.get('table');
            table.trigger('valueChanged');
        }
    });

    //
    module.exports = View;
});
