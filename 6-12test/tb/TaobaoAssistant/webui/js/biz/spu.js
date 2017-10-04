$(function(){
    loadCallbackQueue.add(function(){
        $(".spu_content").mCustomScrollbar(config.scroll);
    });

    $("#create_product_button").click(function(){
        spu.create();
    });

    $(".spu_bg1").draggable();

    /*取消：丢弃数据，X：数据缓存*/
    var PRODUCT_CREATE = 1;
    var PRODUCT_UPDATE = 2;
    window.spu = new (function(){
        var lastMode_ = undefined;
        var lastProductId_ = -99;
        var isCached_ = false;
        var hasError_ = true;

        var $spu_ = $(".spu_bg0");
        var $left_ = $(".spu_content_left", $spu_);
        var $right_ = $(".spu_content_right", $spu_);
        var $title_ = $(".spu_title", $spu_);
        var $buttom_ = $(".spu_buttom", $spu_);
        var $xButton_ = $(".spu_close", $spu_);

        $xButton_.click(function(){
            $spu_.hide();
            isCached_ = true;
        });

        var $cancelButton_ = $("<div>").addClass("spu_button").text("取消").click(function(){
            $spu_.hide();
            isCached_ = false;
            clear();
        });

        var tipCreateOk = function(text, time){
            debug.trace(text);
            var $tip = $("<div>").addClass("tip-edit-spu-ok").text(text);
            $("body").append($tip);

            if(time < 400){ time = 400;}
            setTimeout(function(){
                $tip.remove();
            }, time);
        }

        var $createButton_ = $("<div>").addClass("spu_button").text("创建").click(function(){
             //让当前获取焦点的输入框失去焦点
            $(document.activeElement).blur();

            //创建产品
            FieldManager.sync(lastProductId_, shell.constants.schema.PRODUCT_ADD);
            shell.addProduct(function(result){
                if(result == config.cpp.OK){
                    hide();
                    tipCreateOk("创建SPU产品成功^_^", 800);
                    setTimeout(function(){
                        debug.log("renderItemSchema--create");
                        shell.renderItemSchema(true, "0");
                    }, 40);
                }else{
                    process.notifyNetError(result);
                }
            });
        });

        //点击事件被响应时，未失去焦点，当前修改不会被写入后台 #5940686 创建类似
        var $updateButton_ = $("<div>").addClass("spu_button").text("更新").click(function(){
            //让当前获取焦点的输入框失去焦点
            $(document.activeElement).blur();

            //更新产品
            FieldManager.sync(lastProductId_, shell.constants.schema.PRODUCT_UPDATE);
            shell.updateProduct(lastProductId_, function(result){
                if(result == config.cpp.OK){
                    hide();
                    tipCreateOk("更新SPU产品成功^_^", 800);
                    setTimeout(function(){
                        debug.log("renderItemSchema--update");
                        shell.renderItemSchema(false, lastProductId_);
                    }, 40);
                }else{
                    process.notifyNetError(result);
                }
            });
        });

        var clear = function(){
            lastMode_ = undefined;
            lastProductId_ = -99;
            isCached_ = false;
            hasError_ = true;

            $(".spu_content_left").empty();
            $(".spu_content_right").empty();

            FieldManager.clear(shell.constants.schema.PRODUCT_ADD);
            FieldManager.clear(shell.constants.schema.PRODUCT_UPDATE);
        };

        var hide = function(){
            $spu_.hide();
        }

        var preDefineCount = function(pre, fields){
            var count = 0;
            for(var i = 0; i < fields.length; ++i){
                if(pre.hasOwnProperty(fields[i].id)){
                    ++count;
                }
            }
            return count;
        }

        var checkSpecifiedField = function(fields, id){
            var has = false;
            for(var i = 0; i < fields.length; ++i){
                if(fields[i].id == id){
                    has = true;
                    break;
                }
            }
            return has;
        }

        var loadProductSchema = function(fields, schemaType){
            for(var i = 0; i < fields.length; ++i){
                fields[i].schemaType = schemaType;
                fields[i].isProduct = true;
            }

            var right = util.lightClone(frame.productAdd());
            var rightCount = preDefineCount(right, fields);
            var extraCount = checkSpecifiedField(fields, "product_images") ? 8 : 0;
            var rightAdd = {};
            if(rightCount < (fields.length - extraCount) / 2){
                var addCount = (fields.length - extraCount) / 2 - rightCount;
                for(var i = fields.length - 1; i >= 0 && addCount >= 1; --i){
                    var id = fields[i].id;
                    if(id && !right.hasOwnProperty(id)){
                        rightAdd[id] = "";
                        right[id] = "";
                        --addCount;
                    }
                }
            }

            loadOthers(right, fields, ".spu_content_left", schemaType);
            loadSchema(frame.productAdd(), fields, ".spu_content_right", schemaType);
            loadSchema(rightAdd, fields, ".spu_content_right", schemaType);

            RuleEngine.applyCommands(schemaType);
            FieldManager.applyRules(schemaType);
        }

        var detachAllButtons = function(){
            $cancelButton_.detach();
            $createButton_.detach();
            $updateButton_.detach();
        }

        this.edit = function(productId){
            $spu_.show();
            if(hasError_ || !isCached_ || productId != lastProductId_ || lastMode_ != PRODUCT_UPDATE){
                clear();
                detachAllButtons();
                $buttom_.append($updateButton_).append($cancelButton_);
                $title_.text("更新SPU");


                shell.schemaOfUpdateProduct(productId, function(json){
                    if(json == "error"){
                        $spu_.hide();
                        isCached_ = false;
                        clear();
                    }else{
                        hasError_ = false;
                        var fields = JSON.parse(json);
                        loadProductSchema(fields["tokens"], shell.constants.schema.PRODUCT_UPDATE);
                    }   
                });
            }else{
                debug.warn("update product cache!");
            }

            lastMode_ = PRODUCT_UPDATE;
            lastProductId_ = productId;
            isCached_ = false;
        }

        this.create = function(){
            $spu_.show();
            if(hasError_ || !isCached_ || lastMode_ != PRODUCT_CREATE){
                clear();
                detachAllButtons();
                $buttom_.append($createButton_).append($cancelButton_);
                $title_.text("创建SPU");

                shell.schemaOfAddProduct(function(json){
                    if(json == "error"){
                        $spu_.hide();
                        isCached_ = false;
                        clear();
                    }else{
                        hasError_ = false;
                        var fields = JSON.parse(json);
                        loadProductSchema(fields["tokens"], shell.constants.schema.PRODUCT_ADD);
                    }   
                });
            }else{
                debug.warn("create product cache!");
            }

            lastMode_ = PRODUCT_CREATE;
            lastProductId_ = 0;
            isCached_ = false;
        }

        this.clear = function(){
            $spu_.hide();
            $("#spu_section").css("display", "none");
            $("#add_spu_section").css("display", "none");
            clear();
            debug.log("spu clear");
        }
        //
    })();
});

///////////////////////////////////////////////////////
process.reminderCreateProduct = function(){
    spu.clear();
    $("#spu_section").css("display", "none");
    $("#add_spu_section").css("display", "block");

    basic.clearItemEditSchema();
}

process.renderProductList = function(){
    spu.clear();
    $("#spu_section").css("display", "block");
    $("#add_spu_section").css("display", "none");

    var createProductIndex = function(product, currentProductId){
        // id, title, valid, match

        //选中状态
        var $index = $("<div>").addClass("spu_item spu_item_holder clearfix").click(function(){
            if(product.valid == true){
             }else{
                var options = {
                    title:"提示",
                    content:"您当前所选的产品处于被禁发或待审核状态，不可选择",
                    buttons:[
                        {text:"知道了", click:function(){
                            dialog.close();
                        }}
                    ],
                    contentIcon:"defualt"
                };

                var dialog = new SchemaDialog(options);
                dialog.show();
            }
         }).hover(function(){//hover状态
            //清空状态
            var $spuItem = $(this);
            $(".spu_item").removeClass("spu_item_selected").addClass("spu_item_holder");

            var $oldEdit = $(".spu_item_edit");
            if ($oldEdit) {
                $oldEdit.remove();
            }

            //添加状态
            $spuItem.addClass("spu_item_holder").removeClass("spu_item_selected");

            //编辑按钮
            if(product.valid == true){
                var $edit = $(this);
                $edit = $("<div>").addClass("spu_item_edit").text("查看").attr("product_id", product.id).click(function () {
                    var id = $(this).attr("product_id");
                    spu.edit(id);
                    event.stopPropagation();
                });

                $index.append($edit);
            }
        }, function(){
                var $oldEdit = $(".spu_item_edit");
                if ($oldEdit) {
                    $oldEdit.hide();
                }
            }
        );



        //基础状态
        //radio
        $radioBtn = $("<input type='radio' name='spuRadio' id='checkRadio' value=product.title>").addClass("spu_item_radio").attr("product_id", product.id).click(function(){
            if(product.valid == false){
                $radioBtn.attr("checked", false);
            }else{
                var productId = $radioBtn.attr("product_id");
                shell.productId(function(currentProductId){
                    if(productId != currentProductId){
                        shell.renderItemSchema(false, productId);
                    }
                });
            }
        });
        if(product.valid == false){
            $radioBtn.attr("name", 'disableRadio');
        }
        $radioBtn.addClass("radio_icon float_left");
        $index.append($radioBtn);
        //title
        $index.append($("<div>").addClass("spu_item_title").text(product.title).attr("title", util.title(product.title, 224, "title-clac")));

        //选中
        if(currentProductId == product.id){
            $index.addClass("spu_item_selected").removeClass("spu_item_holder");
            $radioBtn.attr("checked", true);
        }

        //灰选
        if(product.valid == false){
            $index.addClass("spu_item_disabled");
        }

        return $index;
    }

     //加载具体产品schema数据
    var $spuList = $("#product_list");
    $spuList.empty();
    
    var products = shell.products;
    shell.productId(function(currentProductId){
        $spuList.empty();
        for(var i = 0; i < products.length; ++i){
            var productIndex = products[i];
            if(!productIndex.id){
                continue;
            }

            var $index = createProductIndex(productIndex, currentProductId);
            var $line = $("<hr/>");
            $spuList.append($index);
            $spuList.append($line);
        }
    });
}