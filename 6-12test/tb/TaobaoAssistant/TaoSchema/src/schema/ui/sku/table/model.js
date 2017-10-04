/**
 * IN:
 * table
 * inputs
 * metas
 * parent
 */

define(function(require, exports, module) {
    //
    var Model = Backbone.Model.extend({
        events: {
            'skuMetaChanged': 'sku元属性变化'
        },

        initialize: function() {
            var metas = this.get('metas');
            metas.on('skuMetaChanged', this.onMetaValueChanged, this);
            metas.on('customPropCountChanged', this.onCustomPropCountChanged, this);

            // init dataTypes
            var dataTypes = {};
            _.extend(dataTypes, metas.dataTypes());

            var inputs = this.get('inputs');
            _.each(inputs.children(), function(input) {
                dataTypes[input.id] = input.get('dataType');
            });

            this.set('dataTypes', dataTypes);

            // sku校验
            var sku = this.get('table');
            sku.on('valueChanged', this.onSkuChanged, this);
        },

        onMetaValueChanged: function() {
            this.trigger('skuMetaChanged');
        },

        fetch: function(id, sku) {
            var values = [];
            _.each(sku, function(item) {
                values.push(item[id]);
            });
            return values;
        },

        hasError: function(name, errors) {
            var has = false;
            _.find(errors, function(error) {
                if (error.name === name) {
                    has = true;
                    return true;
                }
            });
            return has;
        },

        onSkuChanged: function(isValidate) {
            var me = this;
            var inputs = this.get('inputs');
            var sku = this.get('table');
            var errors = {};

            // 收集错误
            if (_.isArray(sku.value()) && sku.value().length > 0) {
                _.each(inputs.children(), function(input) {
                    errors[input.id] = {};
                    var values = me.fetch(input.id, sku.value());
                    _.each(values, function(value) {
                        input.setValue(value);
                        input.set('submit', true);
                        input.validate(true);
                        input.set('submit', false);
                        var subErrors = input.get('errors');
                        _.each(subErrors, function(error) {
                            errors[input.id][error.name] = error.text;
                        });
                    });
                });
            }

            // 组装错误
            var skuErrors = {};
            _.each(inputs.children(), function(input) {
                if (!_.isEmpty(errors[input.id])) {
                    var errorText = '';
                    _.each(errors[input.id], function(text, name) {
                        if (errorText) {
                            errorText += '；';
                        }
                        errorText += text;
                    });

                    skuErrors[input.id] = {
                        name: input.id,
                        text: input.get('title') + '：' + errorText
                    };
                }
            });

            // 更新错误
            if (_.isEmpty(skuErrors)) {
                sku.removeRuleError('sku-normal');
            } else {
                if (isValidate) {
                    sku.addRuleError('sku-normal', '商品规格存在错误，详细见表格下方');
                }
            }

            var lastErrors = sku.get('errors');
            _.each(inputs.children(), function(input) {
                if (me.hasError(input.id, lastErrors)) {
                    if (skuErrors[input.id]) {
                        if (isValidate) {
                            sku.addRuleError(skuErrors[input.id].name, skuErrors[input.id].text);
                        }
                    } else {
                        sku.removeRuleError(input.id);
                    }
                } else {
                    if (skuErrors[input.id]) {
                        if (isValidate) {
                            sku.addRuleError(skuErrors[input.id].name, skuErrors[input.id].text);
                        }
                    } else {
                        sku.removeRuleError(input.id);
                    }
                }
            });
        },

        dataTypes: function() {
            return this.get('dataTypes');
        },

        onCustomPropCountChanged: function(metas) {
            var isCustomProp = function(id) {
                return (id.indexOf('prop_') === 0 && Number(id.substr(5)) < 0);
            };

            var isProp = function(id) {
                return (id.indexOf('prop_') === 0);
            };

            var table = this.get('table');
            var headers = table.get('headers');
            if (!_.isArray(headers)) {
                headers = [];
                table.set('headers', headers);
            }

            // 查找出所有自定义销售属性，以及最后一个销售属性的位置（插入点）
            var customIndexList = [];
            var lastPropIndex = -1;
            _.each(headers, function(header, index) {
                if (isProp(header.id)) {
                    if (isCustomProp(header.id)) {
                        customIndexList.push(index);
                    } else {
                        lastPropIndex = index;
                    }
                }
            });

            // 从后往前，依次移除
            for (var i = customIndexList.length - 1; i >= 0; --i) {
                headers.splice(customIndexList[i], 1);
            }

            // 从前往后，依次添加
            var insertIndex = lastPropIndex;
            for (var i = 0; i < metas.length; ++i) {
                var customProp = metas[i];
                if (customProp.isCustomSale()) {
                    insertIndex += 1;
                    headers.splice(insertIndex, 0, {
                        id: customProp.id,
                        title: customProp.get('title')
                    });
                }
            }

            // 通知更新sku
            this.trigger('skuMetaChanged');
        },
    });

    //
    module.exports = Model;
});
