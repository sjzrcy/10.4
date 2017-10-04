

define(function(require, exports, module){

    var shell = require('src/base/shell/shell');
    var bind = require('src/base/framework/bind');

    /*
    判断对象属于什么类型
    */
    exports.getVarType = function(inputObj){
        if(typeof(inputObj) == "string")
            return "string";

        if(typeof(inputObj) == "number")
            return "number";

        if(typeof(inputObj) == "boolean")
            return "boolean";

        if(typeof(inputObj) == "object"){
            if(_.isArray(inputObj))
                return "array";
            else
                return "object";
        }
    }

   

     //sku_prop
     /*
    "prop_1627207": [
      {
        "alias": "",
        "imgUrl": "http://img.daily.taobaocdn.net/imgextra/i2/3636620212/TB254NaXXXXXXaLXpXXXXXXXXXX_!!3636620212.jpg",
        "text": "天蓝色",
        "value": "3232484"
      }
    ],
     */


     /*
     entity 转 json
     功能：查找sku属性上的自定义图片
     参数：
     skuPicList: sku图片的集合
     key：sku的value
     */
     exports.findSkuPropImageBykey = function(skuPicList, prop, value){
        if(skuPicList != null){
             for (var i = 0; i < skuPicList.length; i++) {
                var item = skuPicList[i];
                var properties = item.properties;
                if(properties != null){
                    var pvs = properties.split(":");
                    if(pvs.length == 2 && pvs[0] == prop && pvs[1] == value){
                        return item.url;
                    }
                }
            };           
        }
     }

     /*
     entity 转 json
     功能：查找该条prop的alias
     参数：
     propAliasStr: 别名的集合，最初取自itementity的inputstr
     prop：属性id
     value：属性的值
     */
     exports.findAliasBykey = function(propAliasStr, prop, value){
        if(propAliasStr != null){
            var propAliasList = propAliasStr.split(';');
            for (var i = 0; i < propAliasList.length; i++) {
                var item = propAliasList[i];
                var itemList = item.split(':');
                if(itemList.length == 3){
                    var key = itemList[0];
                    if(key == prop && itemList[1] == value){
                        var alias = itemList[2];
                        return alias;
                    }
                }
            }
         }
     };

     /*
     entity 转 json
     功能：查找该条prop的alias
     参数：
     customCpvStr: 自定义属性的集合，最初取自itementity的input_custom_cpv
     prop：属性id
     value：属性的值
     */
     exports.findCustomCpvBykey = function(customCpvStr, prop, value){
        if(customCpvStr != null){
            var customCpvList = customCpvStr.split(';');
            for (var i = 0; i < customCpvList.length; i++) {
                var item = customCpvList[i];
                var itemList = item.split(':');
                if(itemList.length == 3){
                    var key = itemList[0];
                    if(key == prop && itemList[1] == value){
                        var customcpv = itemList[2];
                        return customcpv;
                    }
                }
            }
         }
     };



     /*
     entity 转 json
     功能：查找该条prop的remark
     参数：
     propRemarkStr: 备注的集合，最初取自itementity的cpv_memo
     prop：属性id
     value：属性的值
     */
     exports.findRemarkBykey = function(propRemarkStr, prop, value){
        if(propRemarkStr != null){
            var propRemarkList = propRemarkStr.split(';');
            for (var i = 0; i < propRemarkList.length; i++) {
                var item = propRemarkList[i];
                var itemList = item.split(':');
                if(itemList.length == 3){
                    var key = itemList[0];
                    if(key == prop && itemList[1] == value){
                        var remark = itemList[2];
                        return remark;
                    }
                }
            }
         }
     };

     exports.isContained = function(valueList, valueItem){
        var bContained = false;
        for (var i = 0; i < valueList.length; i++) {
            if(valueList[i].value == valueItem.value){
                bContained = true;
            }
        };

        return bContained;
     }

     /*
     entity 转 json
     功能：组装sku中对应的属性的结构
     例：（颜色）
     "prop_1627207": [
      {
        "imgUrl": "https://img.alicdn.com/imgextra/i3/443534648/TB2UdbQjVXXXXbCXXXXXXXXXXXX-443534648.jpg",
        "text": "",
        "value": "3232483",
        "alias": "别名1"
        "remark": "备注1"
      },
      {
        "imgUrl": "https://img.alicdn.com/imgextra/i1/443534648/TB2BvP0jVXXXXX4XXXXXXXXXXXX-443534648.jpg",
        "text": "",
        "value": "28332"
        "alias": "别名2"
        "remark": "备注2"
      }
    ]

     参数：
     skulist: 
     skuPicList：
     propertyAlias：
     key：
     */
     exports.getSkuPropValueBykey = function(skulist, skuPicList, remarkList, propertyAliasList, customcpvList, key){
        var value = [];
        for (var i = 0; i < skulist.length; i++) {
            var valueItem = {};
            var item = skulist[i];
            var propsName = item.properties;
            //propsName = 1627207:3232484;1630696:3266779
            var propsNameList = propsName.split(";");
            for (var j = 0; j < propsNameList.length; j++) {
                var props = propsNameList[j];
                var pvs = props.split(":");
                if(pvs.length == 2 && pvs[0] == key){
                    valueItem.text = "";
                    valueItem.value = pvs[1];
                    //imaUrl
                    var imgUrl = this.findSkuPropImageBykey(skuPicList, key, pvs[1]);
                    if(imgUrl != null){
                        valueItem.imgUrl = imgUrl;
                    }

                    //remark(备注)
                    var remark = this.findRemarkBykey(remarkList, key, pvs[1]);
                    if(remark != null)
                        valueItem.remark = remark;

                    //alias
                    var alias = this.findAliasBykey(propertyAliasList, key, pvs[1]);
                    if(alias != null){
                        valueItem.alias = alias;
                    }

                    //customcpv
                    var customcpv = this.findCustomCpvBykey(customcpvList, key, pvs[1]);
                    if(customcpv != null){
                        valueItem.text = customcpv;
                    }
                    

                    if(!this.isContained(value, valueItem)){
                        value.push(valueItem);     
                    }
                    break;
                }
            };
        };

        return value;
     }

  

     /*
     entity 转 json
     功能：组装类目属性中的结构【单选】
     例：（颜色）
     "prop_10000": {
      "text": "翻盖",
      "value": "10002",
      "alias":"别名",
      "remark":"备注"
    }

     参数：
     itemString: 
     inputCustomCpv
     cpvMemo
     propAlias
     */
     exports.getPorpsItemValue = function(itemString, inputCustomCpv, cpvMemo, propAlias){
        var itemList = itemString.split(":");
        if(itemList.length == 2){
            var value = {};
            value.text = "";
            value.value = itemList[1];
            var key = itemList[0];

            //alias
            var alias = this.getAliasByProp(key, value.value, propAlias);
            if(alias != null)
                value.alias = alias;

            //remark(备注)
            var remark = this.getRemarkByProp(key, value.value, cpvMemo);
            if(remark != null)
                value.remark = remark;

            //customcpv
            var customcpv = this.getCustomByProp(key, value.value, inputCustomCpv);
            if(customcpv != null)
                value.text = customcpv;            

            return value;           
        }
     }

     /*
     entity 转 json
     功能：组装类目属性中的结构【多选】
     例：（颜色）
      "prop_20574": [
        {
          "text": "WIFI",
          "value": "32517"
        },
        {
          "text": "GPS",
          "value": "20710"
        },
        {
          "text": "手写输入",
          "value": "28969"
        }
      ]

     参数：
     itemString: 
     inputCustomCpv
     cpvMemo
     propAlias
     */
    exports.getMultiItemValue = function(itemlist, inputCustomCpv, cpvMemo, propAlias){
        var value = [];
        for (var i = 0; i < itemlist.length; i++) {
            var valueItem = {};
            var item = itemlist[i];
            var pvs = item.split(":");
            if(pvs.length == 2){
                valueItem.text = "";
                valueItem.value = pvs[1].toString();
                var key = pvs[0];
                //alias
                var alias = this.getAliasByProp(key, valueItem.value, propAlias);
                if(alias != null)
                    valueItem.alias = alias;
                //remark
                var remark = this.getRemarkByProp(key, valueItem.value, cpvMemo);
                if(remark != null)
                    valueItem.remark = remark;
                //custom
                var customcpv = this.getCustomByProp(key, valueItem.value, inputCustomCpv);
                if(customcpv != null)
                    valueItem.text = customcpv;    

            }
            value.push(valueItem);
        };

        return value;
     }

     exports.findTheSameKeyItems = function(pvList, keyItem){
        var sameItems = [];
        var keyItemPvs = keyItem.split(":");
        var key = keyItemPvs[0];
        for (var i = 0; i < pvList.length; i++) {
            var item = pvList[i];
            var pvs = item.split(":");
            if(key == pvs[0] ){
                sameItems.push(item);
            }
        };

        return sameItems;
     }

     exports.removeItemByName = function(itemList, item){
        var newItemList = [];
        for (var i = 0; i < itemList.length; i++) {
            if(itemList[i] != item)
                newItemList.push(itemList[i]);
        };

        return newItemList;
     }

     exports.getAliasByProp = function(prop, value, propAliasStr){
        if(propAliasStr != null){
            var propAliasList = propAliasStr.split(';');
            for (var i = 0; i < propAliasList.length; i++) {
                var item = propAliasList[i];
                var itemList = item.split(':');
                if(itemList.length == 3){
                    var key = itemList[0];
                    if(key == prop && itemList[1] == value){
                        var alias = itemList[2];
                        return alias;
                    }
                }
            };
        }
     }

    exports.getRemarkByProp = function(prop, value, propRemarkStr){
        if(propRemarkStr != null){
            var propRemarkList = propRemarkStr.split(';');
            for (var i = 0; i < propRemarkList.length; i++) {
                var item = propRemarkList[i];
                var itemList = item.split(':');
                if(itemList.length == 3){
                    var key = itemList[0];
                    if(key == prop && itemList[1] == value){
                        var remark = itemList[2];
                        return remark;
                    }
                }
            };
        }
     }

    exports.getCustomByProp = function(prop, value, propCustomStr){
        if(propCustomStr != null){
            var propCustomList = propCustomStr.split(';');
            for (var i = 0; i < propCustomList.length; i++) {
                var item = propCustomList[i];
                var itemList = item.split(':');
                if(itemList.length == 3){
                    var key = itemList[0];
                    if(key==prop && itemList[1]==value){
                        var customStr = itemList[2];
                        return customStr;
                    }
                }
            };
        }
     }

    /*
     entity 转 json
     功能：sku转换
     参数：oldSku：entity中skuentity拼接的出来的组合
     */
     exports.one2jSku = function(oldSku, inputCustomCpv){
        var jsonSku = [];
        for (var i = 0; i < oldSku.length; i++) {
            var item = oldSku[i];
            var newItem = {};
            var pvs = item.properties;
            var pvArray = [];
            pvArray = pvs.split(";");
            if(pvArray.length == null)
                return;
            for(var j=0; j<pvArray.length; j++){
                var pv = new Array();
                pv = pvArray[j].split(":");
                if(pv.length == 2){
                    var p = pv[0];
                    var v = pv[1];
                    var p_obj = "prop_"+p; 
                    var v_obj = new Object();
                    v_obj.value = v;
                    var txtStr = this.getCustomByProp(p, v, inputCustomCpv);
                    if(txtStr!=null){
                        v_obj.text = txtStr;
                    }else{
                      v_obj.text = "";                      
                    }
                    newItem[p_obj] = v_obj;
                }
            }
            newItem["price"] = item.price;
            newItem["quantity"]= item.quantity;
            newItem["barcode"]= item.barcode;
            newItem["skuId"]= item.sku_id;
            newItem["outerId"]= item.outerId;
            jsonSku.push(newItem);
        }

        return jsonSku;
     }

     /*
         entity 转 json
         功能：props中的属性通过schemakey过滤一把，防止存在schema不支持的属性
         参数：
     */
     exports.isContainedInSchemaKeyList = function(SchemaKey, pv){
        for (var i = 0; i < SchemaKey.length; i++) {
            var key = SchemaKey[i];
            var item = pv.split(":");
            if(item.length == 2){
                var p = "prop_" + item[0] ;
                if(key == p){
                    return true;
                }
            }
        }
        return false;
     }

     /*
        自定义销售属性
        入参：pvList
     */
     exports.convertSalePropCustom = function(pvList){
        var salePropList = [];
        for (var i = 0; i < pvList.length; i++) {
            var pv = pvList[i].split(":");
            var p = pv[0];
            var v = pv[1];
            var p_name = '';
            var v_name = '';
            if(pv.length==4){
                p_name = pv[2];
                v_name = pv[3];
            }
            this.addToSalePropCustomList(salePropList, p, v, p_name, v_name);
        }
        return salePropList;
     }

    /*
        组织SalePropCustom节点，如果存在，则加入到已存在的结构中，如果不存在，则另起一个节点
    */
     exports.addToSalePropCustomList = function(salePropList, new_p, new_v, p_name, v_name){
        var oldExist = false;

        for(var i=0; i<salePropList.length; i++){
            var node = salePropList[i];
            var value = node.value;
            var exist_p = value.replace("prop_", "");
            if(exist_p == new_p){
                oldExist = true;
                var obj = {};
                obj.text = v_name;
                obj.value = new_v;
                var items = node.items;
                items.push(obj);
                node.items = items;
            }
            salePropList[i] = node;
        }

        if(oldExist == false){
            var node = {};
            node.text = p_name;
            node.value = "prop_" + new_p;
            var items = [];
            var item = {};
            item.text = v_name;
            item.value = new_v;
            items.push(item);
            node.items = items;
            salePropList.push(node);
        }

     }



      /************************************************************************************************************************
        entity 转 json
        第二步
     ************************************************************************************************************************/
     exports.convertOneLevelStrToJsonData = function(onelevelStr){

        try{
            var contentObj = JSON.parse(onelevelStr);
            var jsonStr = "";
            var jsonObj =  new Object();
            var delItemKey = [];

            /*未对应字段
            detailTemplate
            saleMode
            */

            //cid
            if(contentObj.cid != null)
                jsonObj.catId = contentObj.cid;
            
            //itemId
            if(contentObj.num_iid != null)
                jsonObj.itemId = contentObj.num_iid;

            //title
            if(contentObj.title != null)
                jsonObj.title = contentObj.title;

            //subtitle
            if(contentObj.sell_point != null)
                jsonObj.subTitle = contentObj.sell_point;

            //stuff_status
            if(contentObj.stuff_status != null){
                if(contentObj.stuff_status == 1){
                    jsonObj.stuffStatus = 5;      
                }else if(contentObj.stuff_status == 3){
                    jsonObj.stuffStatus = 6;         
                }            
            }

            //outer_id
            if(contentObj.outer_id != null){
                jsonObj.outerId = contentObj.outer_id;            
            }

            //barcode
            if(contentObj.barcode != null){
                jsonObj.barcode = contentObj.barcode;  
            }
            
            //price
            if(contentObj.price != null){
               jsonObj.price = contentObj.price;            
            }

            //quantity
            if(contentObj.num != null){
                jsonObj.quantity = contentObj.num; 
            }
           

            //全球购purchaseLocation
            if(contentObj.buy_area_type != null){
                if(contentObj.buy_area_type == 0){
                    var purchaseLocation = new Object();
                    purchaseLocation.isGlobalStock = "false";
                    jsonObj.purchaseLocation = purchaseLocation;
                }else if(contentObj.buy_area_type == 1){
                    var purchaseLocation = new Object();
                    purchaseLocation.isGlobalStock = "true";
                    var globalStock = new Object();
                    globalStock.stockCountry = contentObj.global_stock_country;
                    globalStock.stockType = contentObj.global_stock_type;
                    purchaseLocation.globalStock = globalStock;
                    jsonObj.purchaseLocation = purchaseLocation;
                }            
            }

            //multiMedia
            var multiMedia = new Object();
            {
                  //imageVideo
                if(contentObj.imageVideo!=null){
                    multiMedia.imageVideo = contentObj.imageVideo;  
                }

                //image        
                if(contentObj.image != null){
                    var imageList = contentObj.image;
                    var image = new Array();
                    for(var i=0; i<imageList.length; i++){
                        if(i>=5)
                          break;
                        var imageItem = imageList[i];
                        var item = new Object();
                        item.url = imageItem.url;
                        item.position = imageItem.position;
                        if(imageItem.position == 0)
                            item.major = true;
                        else
                            item.major = false;
                        image.push(item);
                    }
                    multiMedia.image = image;
                }              
            }
            jsonObj.multiMedia = multiMedia;

            //descForPC
            if(contentObj.descForPC != null){
               jsonObj.descForPC = contentObj.descForPC;  
            }
            
            //descForMobile
            if(contentObj.descForMobile != null){
                jsonObj.descForMobile = contentObj.descForMobile;            
            }

            //shopCats
            if(contentObj.seller_cids != null){
                jsonObj.shopCats =contentObj.seller_cids;    
            }


            //deliverTemplate
            if(contentObj.postage_id != null){
                var way = [];
                way.push(1);
                jsonObj.deliverWay = way;
                jsonObj.deliverTemplate = contentObj.postage_id;
            }


            //deliveryParams
            if(contentObj.item_size!=null && contentObj.item_weight!=null){
                var deliveryParams = new Object();
                deliveryParams.deliverVolumn = contentObj.item_size;
                deliveryParams.deliverWeight = contentObj.item_weight;
                jsonObj.deliveryParams = deliveryParams;      
            }


            //售后模板
            var afterSale = new Object();

            var invoice = [];
            if(contentObj.has_invoice){
                invoice.push(1);
                afterSale.invoice = invoice;
            }else{
                afterSale.invoice = undefined;
                delItemKey.push("invoice");
            }

            var warrant = [];
            if(contentObj.has_warranty){
                warrant.push(1);
                afterSale.warrant = warrant;
            }else{
                afterSale.warrant = undefined;
                delItemKey.push("warrant");
            }


            var sellPromise = [];
            if(contentObj.sell_promise){
                sellPromise.push(1);       
                afterSale.sellPromise = sellPromise;                
            }else{
                afterSale.sellPromise = undefined;
                delItemKey.push("sellPromise");
            }

            if(contentObj.forceYes != null){
                var forceYes = new Array();
                forceYes.push(1);
                afterSale.forceYes = forceYes;
            }else{
                afterSale.forceYes = undefined; 
            }

            if(contentObj.forceNo != null){
                var forceNo = new Array();
                forceNo.push(2);
                afterSale.forceNo = forceNo;
            }else{
                afterSale.forceNo = undefined;
            }

            if(contentObj.custom != null){
                var custom = new Array();
                custom.push(3);
                afterSale.custom = custom;
            }else{
                afterSale.custom = undefined;
            }

            jsonObj.afterSale = afterSale;

            //上架相关
            if(contentObj.startTime != null){
                jsonObj.startTime = contentObj.startTime;
            }

            //has_showcase
            if(contentObj.has_showcase != null){
                if(contentObj.has_showcase === true){
                    var promote = [];
                    promote.push(1);
                    jsonObj.promote = promote;                   
                }else{
                    var promote = [];
                    promote.push(0);
                    jsonObj.promote = promote;     
                }
            }

            //has_discount
            if(contentObj.has_discount != null){
                if(contentObj.has_discount === true)
                    jsonObj.vipDiscount = 1;
                else
                    jsonObj.vipDiscount = 0; 
            }
            

            //sub_stock
            if(contentObj.sub_stock != null){
                 if(contentObj.sub_stock==1){
                    jsonObj.subStockType = 0;
                }else if(contentObj.sub_stock==2){
                    jsonObj.subStockType = 1; 
                }           
            }

            //sku
            if(contentObj.sku != null){
                jsonObj.sku = this.one2jSku(contentObj.sku, contentObj.inputCustomCpv);            
            }

            //类目属性项,使用props来解析，因为propsName可能为空
            if(contentObj.props != null){
                
                var propsList = contentObj.props.split(";");

                //通过schemaKey过滤一遍                
                if(contentObj.SchemaKey != null){
                    var filterPropsList = [];
                    var schemaKeyList = contentObj.SchemaKey.split(",");
                    for(var k=0; k<propsList.length; k++){
                        var pv = propsList[k];
                        if(this.isContainedInSchemaKeyList(schemaKeyList, pv)){
                            filterPropsList.push(pv);
                        }
                    }
                    propsList = filterPropsList;
                }

                //先处理多选
                var itemList = propsList;
                var itemCopyList = propsList;
                for (var i = 0; i < itemList.length; i++) {
                    var item = itemList[i];
                    //查找同属性元素
                    var bMultiItem = false;
                    var sameItem = this.findTheSameKeyItems(itemCopyList, item); 
                    if(sameItem.length > 1)
                        bMultiItem = true;

                   
                    if(contentObj.SchemaArrayTypekey != null){
                        for(var j=0; j<contentObj.SchemaArrayTypekey.length; j++){
                            var arrayKey = contentObj.SchemaArrayTypekey[j];
                            if(sameItem.length >= 1){
                                var pvs = sameItem[0].split(":");
                                var key = "prop_" + pvs[0];
                                if(arrayKey == key){
                                    bMultiItem = true;
                                    break;
                                }                               
                            }
                        }
                    }
                    

                    if(bMultiItem){
                        var mItemPvs = sameItem[0].split(":");
                        var mItemkey = "prop_" + mItemPvs[0];
                        var mItemValue = this.getMultiItemValue(sameItem, contentObj.inputCustomCpv, contentObj.cpvMemo, contentObj.propAlias);
                        jsonObj[mItemkey] = mItemValue;

                        for (var j = 0; j < sameItem.length; j++) {
                           propsList = this.removeItemByName(propsList, sameItem[j]); 
                        };
                        
                        //删除已经处理的元素
                        for (var k = 0; k < sameItem.length; k++) {
                           itemCopyList = this.removeItemByName(itemCopyList, sameItem[k]);
                        };
                   }
                }

                //处理单选
                for (var i = 0; i < propsList.length; i++) {
                    var item = propsList[i];
                    var pvs = item.split(":");
                    if(pvs.length == 2){
                        var key = "prop_" + pvs[0];
                        if(contentObj.SchemaArrayTypekey != null){
                            for(var j=0; j<contentObj.SchemaArrayTypekey.length; j++){
                                var arrayKey = contentObj.SchemaArrayTypekey[j];
                                if(arrayKey == key)
                                    continue;
                            }
                        }
                        
                        var value = this.getPorpsItemValue(item, contentObj.inputCustomCpv, contentObj.cpvMemo, contentObj.propAlias); 
                         jsonObj[key] = value;
                    }
                };
            }  

            //输入属性值
            if(contentObj.inputPids != null && contentObj.inputStr != null){
                var inputpidList = contentObj.inputPids.split(",");
                var inputStrList = contentObj.inputStr.split(",");
                for (var i = 0; i < inputpidList.length; i++) {
                   var key =  "prop_" + inputpidList[i];
                   var inputStrItem = inputStrList[i];
                   var inputStrItemList = inputStrItem.split(";");
                   if(inputStrItemList.length >=1){
                    var value = inputStrItemList[0];
                    jsonObj[key] = value;                    
                   }
                };
            }

            //组装sku props,过滤p为负数的值
            if(contentObj.sku != null){
                var skuList = contentObj.sku;
                if(skuList.length != 0){
                    var propsList = skuList[0].properties.split(";");
                    var customList = [];
                    for (var i = 0; i < propsList.length; i++) {
                        var propItem = propsList[i];
                        var pvs = propItem.split(":");
                        if(pvs.length == 2){
                            if(pvs[0] > 0){
                               var key = "prop_" + pvs[0];
                                var value = this.getSkuPropValueBykey(contentObj.sku, contentObj.skuimage, contentObj.cpvMemo, contentObj.propertyAlias, contentObj.inputCustomCpv, pvs[0]);
                                jsonObj[key] = value;   
                            }
                        }
                    };                  
                }
            }

            //新增自定义销售属性（p为负数,就把这个字段加在saleprop_custom中）
            if(contentObj.sku != null){
                var skuList = contentObj.sku;
                if(skuList.length != 0){
                    var customList = [];
                    for(var j=0; j<skuList.length; j++){
                        var sku = skuList[j];

                        var propsList = [];
                        propsList = sku.properties_name.split(";");
                        if(propsList==null){
                            propsList = sku.properties.split(";");
                        }

                        for (var i = 0; i < propsList.length; i++) {
                            var propItem = propsList[i];
                            var pvs = propItem.split(":");
                            if(pvs.length > 0){
                                if(pvs[0] < 0){
                                    var bExit = false;
                                    for(var k=0; k<customList.length; k++){
                                        var p = customList[k].split(":")[0];
                                        var v = customList[k].split(":")[1];
                                        if(p==pvs[0] && p==pvs[1]){
                                            bExit = true;
                                        }
                                    }
                                    if(bExit==false)
                                        customList.push(propItem);
                                }
                            }
                        }; 
                    }
                }
                if(customList.length > 0){
                    jsonObj.saleprop_custom = this.convertSalePropCustom(customList);
                }
            }


            //材质属性
            if(contentObj.materialModel != null){
                var materialModel = JSON.parse(contentObj.materialModel);
                for(var i=0; i<materialModel.length; i++){
                    var modelItem = materialModel[i];
                    var key = "prop_" + modelItem.key;
                    var itemList = modelItem.itemList;
                    var valueList = [];
                    for(var k=0; k<itemList.length; k++){
                        var value = {};
                        var item = itemList[k];
                        var percent = item.value;
                        if(percent.length > 1)
                            percent = percent.substring(0, percent.length-1);
                        value.content = percent;
                        value.text = item.key;
                        value.value = item.key;
                        valueList.push(value);
                    }
                    jsonObj[key] = valueList;
                }
            }


             //最后拼接成一个字符串
            jsonStr = JSON.stringify(jsonObj);
            var delItemKeyStr = '';
            if(delItemKey.length != 0){
                delItemKeyStr = delItemKey.join(",");
            }

            var cid = contentObj.cid;
            shell.convertEntitytoJsonData(cid, jsonStr, delItemKeyStr);
        }catch(e){
             alert("convertEntitytoJsonData error");
             alert(e);
        }
     };

  

    //数据转换
    var convertEntityToJson = function (onelevelstring) {
        exports.convertOneLevelStrToJsonData(onelevelstring);
    };

    //
    bind("entityToJson", convertEntityToJson);

 });