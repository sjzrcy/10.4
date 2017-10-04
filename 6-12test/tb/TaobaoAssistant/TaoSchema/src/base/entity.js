/**
 * 商品操作流程
 */

define(function(require, exports, module) {
    //
    var bind = require('src/base/framework/bind');
    var ErrorDialog = require('src/base/common/dialog/error');
    var callback = require('src/base/shell/callback');

    // 当前索引
    var glocalCid;
    var globalCilentId;
    var glocalItemId = 0;

    // 商品置空
    var clear = function() {
        glocalCid = undefined;
        globalCilentId = undefined;
        glocalItemId = 0;

        // 同时清空schema
        if (as && as.schema) {
            as.schema.reset();
        }
    };

    var renderSchema = function(cid, clientId) {
        // 异步取，需要加载效果
        as.loading.show();

        as.shell.getAllSchema(cid, clientId, function(jsonStr) {
            warn('----------------------\n', jsonStr, '\n----------------------');
            as.loading.hide(); // 取消加载效果

            var params;
            try {
                params = JSON.parse(jsonStr);
                var isSuccess = params.result;
                if (!isSuccess) { // 错误处理 
                    var error = params.error;
                    if (!error) {
                        error = '获取商品数据失败，请重试！';
                    }

                    var dialog = new ErrorDialog({
                        model: {
                            title: '网络访问错误',
                            closeCb: function() {
                                // renderSchema(glocalCid, globalCilentId);
                            },
                            buttons: [{
                                text: '重新加载',
                                click: function() {
                                    dialog.close();
                                    renderSchema(glocalCid, globalCilentId);
                                }
                            }],
                            text: error
                        }
                    });

                    dialog.render();
                    dialog.$el.appendTo($('body'));
                    return;
                }
            } catch (e) {
                error('非法json:' + e.toString());
                error(jsonStr);
                return;
            }

            var JSONSchema = params.dataschema;
            var ui = params.uiconfig;
            var bizData = _.isObject(params.data) ? params.data : {};

            // 兼容千牛，再次设置类目id和商品id
            if (bizData.catId) {
                glocalCid = bizData.catId;
                as.category.setCid(glocalCid);
            }
            if (bizData.itemId) {
                glocalItemId = bizData.itemId;
            }

            as.schema.refresh(JSONSchema, ui, bizData);
        });
    };

    // 切换宝贝，异步从后台取数据(cid可能为0，此时为切换到空白处)
    var set = function(jsonStr) {
        // 关闭各种交互面板
        $('body').trigger('click');

        // 取消以前的回调
        callback.clear();

        var params;
        try {
            params = JSON.parse(jsonStr);
        } catch (e) {
            alert('非法json:' + e.toString());
            error(jsonStr);
            return;
        }

        // 重置当前商品信息索引       
        glocalCid = Number(params.cid);
        globalCilentId = params.clientId;
        glocalItemId = params.itemId;

        // 置空
        as.schema.trigger('beforeSchemaChanged');

        if (!globalCilentId) {
            as.schema.reset();
            return;
        }

        // 监控当前类目id
        if (glocalCid) {
            debug('cid', glocalCid);
            as.category.setCid(glocalCid);
        } else {
            as.category.setCid('0');
        }

        // 渲染schema
        renderSchema(glocalCid, globalCilentId);
    };

    var isRegistered = false;
    var registerSaveCb = function() {
        if (!isRegistered) {
            isRegistered = true;
            as.schema.registerBeforeSaveHandler(function(notifyFinishedCb) {
                var $active = $(document.activeElement);
                if ($active.is(':text')) {
                    $active.blur();
                }

                // 让前端有足够的时间写入数据
                setTimeout(function() {
                    notifyFinishedCb();
                }, 200);
            });
        }
    };

    // 保存数据
    var save = function(jsonStr, qnCb) {
        registerSaveCb(); // 注册entity的保存前回调
        $('body').trigger('click'); // 关闭各种交互面板

        var obj;
        try {
            obj = JSON.parse(jsonStr);
        } catch (e) {
            error('保存-INVALID JSON');
            return;
        }

        var clientId = obj.clientId;
        var isUpload = obj.upload;

        // 因为需要从后台插件中异步取值，故而需要异步化
        as.schema.beforeSave(function() {
            var isValidateOk = as.schema.validate(isUpload ? as.UPLOAD : as.SAVE);

            // 如果为新建，则需要从后台传入clientId
            if (!globalCilentId) {
                globalCilentId = clientId;
            }

            // 如果clientId为空，报错，中断流程
            if (!globalCilentId) {
                return;
            }

            // 保存
            var bizData = as.schema.getBizData();
            bizData['catId'] = glocalCid;
            bizData['itemId'] = glocalItemId;

            warn('save', bizData);
            warn(JSON.stringify(bizData));
            as.shell.saveEntity(globalCilentId, bizData, isValidateOk, function() {
                // 保存后通知千牛
                if (typeof qnCb === 'function') {
                    qnCb({
                        'key': globalCilentId,
                        'upload': isUpload,
                        'validate': isValidateOk,
                        'item': bizData
                    });
                }
            });
        });
    };

    // 验证
    var validate = function() {
        registerSaveCb(); // 注册entity的保存前回调
        $('body').trigger('click'); // 关闭各种交互面板

        // 需要先将值全部回填到模型field中
        as.schema.beforeSave(function() {
            as.schema.validate(as.VALIDATE);
        });
    };

    // 重新渲染，但是业务数据从缓存中取
    var reRenderSchema = function(cid) {
        as.loading.show();
        as.shell.getJSONSchemaAndUIConfig(cid, function(jsonStr) {
            warn('----------------------\n', jsonStr, '\n----------------------');
            as.loading.hide();

            var params;
            try {
                params = JSON.parse(jsonStr);
                var isSuccess = params.result;
                if (!isSuccess) { // 错误处理 
                    var error = params.error;
                    if (!error) {
                        error = '获取类目数据失败，请重试！';
                    }

                    var dialog = new ErrorDialog({
                        model: {
                            title: '网络访问错误',
                            closeCb: function() {
                                // reRenderSchema(glocalCid);
                            },
                            buttons: [{
                                text: '重新加载',
                                click: function() {
                                    dialog.close();
                                    reRenderSchema(glocalCid);
                                }
                            }],
                            text: error
                        }
                    });

                    dialog.render();
                    dialog.$el.appendTo($('body'));
                    return;
                }
            } catch (e) {
                error('非法json:' + e.toString());
                error(jsonStr);
                return;
            }

            var fetchDefault = function(ui) {
                if (_.isObject(ui.global) && _.isObject(ui.global['default'])) {
                    return ui.global['default'];
                } else {
                    return {};
                }
            };

            var JSONSchema = params.dataschema;
            var ui = params.uiconfig;
            var defaults = fetchDefault(ui);
            var bizData = _.extend(defaults, as.schema.getCommonData());
            as.schema.setChangeCid(true);
            as.schema.refresh(JSONSchema, ui, bizData);
        });
    };

    // 重新获取schema并渲染
    var refreshSchema = function() {
        // 刷新界面
        as.schema.trigger('beforeSchemaChanged');
        callback.clear();

        as.loading.show();
        as.shell.refreshJSONSchemaAndUIConfig(glocalCid, { refreshUIConfig: true, refreshDataSchema: true }, function(jsonStr) {
            warn(jsonStr);
            as.loading.hide();

            var params;
            try {
                params = JSON.parse(jsonStr);
                var isSuccess = params.result;
                if (!isSuccess) { // 错误处理 
                    var errorInfo = params.error;
                    if (!errorInfo) {
                        errorInfo = '刷新类目数据失败，请重试！';
                    }

                    var dialog = new ErrorDialog({
                        model: {
                            title: '网络访问错误',
                            closeCb: function() {
                                // refreshSchema(glocalCid);
                            },
                            buttons: [{
                                text: '重新加载',
                                click: function() {
                                    dialog.close();
                                    refreshSchema(glocalCid);
                                }
                            }],
                            text: errorInfo
                        }
                    });

                    dialog.render();
                    dialog.$el.appendTo($('body'));
                    return;
                }
            } catch (e) {
                error('非法json:' + e.toString());
                error(jsonStr);
                return;
            }

            var JSONSchema = params.dataschema;
            var ui = params.uiconfig;
            var bizData = as.schema.getBizData();
            as.schema.refresh(JSONSchema, ui, bizData);
        });
    };

    // 切换类目
    var changeCategory = function(cid) {
        cid = Number(cid);
        if (cid === glocalCid) {
            return;
        }

        // 取消以前的回调
        callback.clear();

        // 刷新界面
        glocalCid = cid;
        as.schema.trigger('beforeSchemaChanged');

        // 更新当前cid
        as.shell.setCurrentCid(glocalCid);

        // 重新渲染
        reRenderSchema(cid);
    };

    // 切换类目
    exports.changeCategory = changeCategory;

    // 当前类目id
    exports.categoryId = function() {
        return glocalCid;
    };

    exports.setCategoryId = function(cid) {
        glocalCid = cid;
    };

    // 当前商品id
    exports.itemId = function() {
        return glocalItemId;
    };

    // 当前clientId
    exports.clientId = function() {
        return globalCilentId;
    };

    // 当前是否有商品
    exports.isReady = function() {
        return (_.isNumber(glocalCid) && glocalCid > 0);
    };

    // 重新加载，刷新当前页面，且保留当前页面的数据
    exports.refreshSchema = refreshSchema;

    // bind 
    bind("entity_set", set);
    bind("entity_validate", validate);
    bind("entity_save", save);
    bind("entity_clear", clear);
});
