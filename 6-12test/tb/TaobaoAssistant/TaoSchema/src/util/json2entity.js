

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


     /************************************************************************************************************************
        json 转 entity
     ************************************************************************************************************************/
     //无线描述
     exports.j2oneWirelessDesc = function(jsonwirelessDesc){
       var newWirelessDescObj = jsonwirelessDesc;
       var oldWirelessDescStr = "";
       oldWirelessDescStr += "<wapDesc>";
       for (var i = 0; i < newWirelessDescObj.length; i++) {
            var item = newWirelessDescObj[i];
            if(item.type != null && item.value != null){
                if(item.type == 'shortDesc'){
                    oldWirelessDescStr += '<shortDesc>';
                    oldWirelessDescStr += item.value;
                    oldWirelessDescStr += '</shortDesc>';
                }

                if(item.type == 'voice'){
                    oldWirelessDescStr += '<voice>';
                    oldWirelessDescStr += item.value;
                    oldWirelessDescStr += '</voice>';
                }

                if(item.type == 'image'){
                    oldWirelessDescStr += '<img>';
                    oldWirelessDescStr += item.value;
                    oldWirelessDescStr += '</img>';
                }  
                
                if(item.type == 'text'){
                    oldWirelessDescStr += '<txt>';
                    oldWirelessDescStr += item.value;
                    oldWirelessDescStr += '</txt>';
                }                                 
            }
        }; 

        oldWirelessDescStr += "</wapDesc>";
        return oldWirelessDescStr;
      }

     //props解析
     exports.parseProps = function(p, propObj){
        if(propObj != null){
            var v = propObj.value;
            if(v!=null){
                var prop = p + ":" + v;
                return prop;           
            }else{
                return null;
            }            
        }
     }

    exports.parsePropsName = function(p, propObj){
        if(propObj != null){
            var v = propObj.value;
            if(v!=null){
                var propName = p;
                propName +=":";
                propName += v;
                propName += ":";
                propName += "";
                propName += ":";
                propName += propObj.text;
                return propName;           
            }else{
                return null;
            }            
        }
     }

    exports.j2oneInputCustomCpv = function(jsonData){
        var customCpvList = [];
        var map = jsonData;
        for(var key in map){
            if(key.indexOf("prop_")>=0){
                var propObj = map[key];

                //key-value 单对
                if(this.getVarType(propObj) == "object"){
                    var item = propObj;
                    if(item!=null && item.value!=null){
                        if(parseInt(item.value) < 0){
                            var cpv = '';
                            var p = key.replace("prop_", "");
                            cpv += p;
                            cpv += ':';
                            cpv += parseInt(item.value);
                            cpv += ':';
                            cpv += item.text;
                            customCpvList.push(cpv);
                        }
                    }
                }

                //key-value 单对
                if(this.getVarType(propObj) == "array"){
                    var pvArray = propObj;
                    for (var i = 0; i < pvArray.length; i++) {
                        var item = pvArray[i];
                        if(item!=null && item.value!=null){
                            if(parseInt(item.value) < 0){
                                var cpv = '';
                                var p = key.replace("prop_", "");
                                cpv += p;
                                cpv += ':';
                                cpv += parseInt(item.value);
                                cpv += ':';
                                cpv += item.text;
                                customCpvList.push(cpv);
                            }
                        }
                    };
                }
            }
        }

        if(customCpvList.length != 0)
            return customCpvList.join(";");
        else
            return null;
     }

    exports.j2onePropAlias = function(jsonData){
        var propAliasList = [];
        var map = jsonData;
        for(var key in map){
            if(key.indexOf("prop_")>=0){
                var propObj = map[key];

                //key-value 单对
                if(this.getVarType(propObj) == "object"){
                    var item = propObj;
                    if(item!=null && item.alias!=null){
                        var cpv = '';
                        var p = key.replace("prop_", "");
                        cpv += p;
                        cpv += ':';
                        cpv += item.value;
                        cpv += ':'
                        cpv += item.alias;
                        propAliasList.push(cpv);                         
                    }
                }

                //key-value 多对         
                if(this.getVarType(propObj) == "array"){
                    var pvArray = propObj;
                    for (var i = 0; i < pvArray.length; i++) {
                        var item = pvArray[i];
                        if(item!=null && item.alias!=null){
                            var cpv = '';
                            var p = key.replace("prop_", "");
                            cpv += p;
                            cpv += ':';
                            cpv += item.value;
                            cpv += ':'
                            cpv += item.alias;
                            propAliasList.push(cpv);
                        }
                    };
                }
            }
        }

        if(propAliasList.length != 0)
            return propAliasList.join(";");
        else
            return null;
     }   

     exports.j2onePropRemarks = function(jsonData){
        var propRemarksList = [];
        var map = jsonData;
        for(var key in map){
            if(key.indexOf("prop_")>=0){
                var propObj = map[key];

                //key-value 单对
                if(this.getVarType(propObj) == "object"){
                    var item = propObj;
                    if(item!=null && item.remark!=null){
                        var cpv = '';
                        var p = key.replace("prop_", "");
                        cpv += p;
                        cpv += ':';
                        cpv += item.value;
                        cpv += ':'
                        cpv += item.remark;
                        propRemarksList.push(cpv);                         
                    }
                }

                //key-value 多对         
                if(this.getVarType(propObj) == "array"){
                    var pvArray = propObj;
                    for (var i = 0; i < pvArray.length; i++) {
                        var item = pvArray[i];
                        if(item!=null && item.remark!=null){
                            var cpv = '';
                            var p = key.replace("prop_", "");
                            cpv += p;
                            cpv += ':';
                            cpv += item.value;
                            cpv += ':'
                            cpv += item.remark;
                            propRemarksList.push(cpv);
                        }
                    };
                }
            }
        }

        if(propRemarksList.length != 0)
            return propRemarksList.join(";");
        else
            return null;
     }   


     exports.j2oneProps = function(jsonData){
        var props = [];
        var map = jsonData;
        for(var key in map){
            if(key.indexOf("prop_")>=0){
                var propObj = map[key];
                //key-value 一对
                if(this.getVarType(propObj) == "object"){
                    var p = key.replace("prop_", "");
                    var pv = this.parseProps(p, propObj)
                    if(pv != null){
                        props.push(pv);                   
                    }        
                }

                //key-value 多对
                if(this.getVarType(propObj) == "array"){
                    var pvArray = propObj;
                    for (var i = 0; i < pvArray.length; i++) {
                        var item = pvArray[i];
                        if(item!=null){
                            var p = key.replace("prop_", "");
                            var pv = this.parseProps(p, item)
                            if(pv != null){
                                props.push(pv);                   
                            }                             
                        }
                    };
                }
            }
        }

        var propsStr = props.join(";");
        return propsStr;
     }

     exports.j2onePropsName = function(jsonData){
        var props = [];
        var map = jsonData;
        for(var key in map){
            if(key.indexOf("prop_")>=0){
                var propObj = map[key];
                //单值
                if(this.getVarType(propObj) == "string"){

                }

                //key-value 一对
                if(this.getVarType(propObj) == "object"){
                    var p = key.replace("prop_", "");
                    var pv = this.parsePropsName(p, propObj)
                    if(pv != null){
                        props.push(pv);                   
                    }        
                }

                //key-value 多对
                if(this.getVarType(propObj) == "array"){
                    var pvArray = propObj;
                    for (var i = 0; i < pvArray.length; i++) {
                        var item = pvArray[i];
                        if(item!=null){
                            var p = key.replace("prop_", "");
                            var pv = this.parsePropsName(p, item)
                            if(pv != null){
                                props.push(pv);                   
                            }                             
                        }
                    };
                }
            }
        }

        var propsStr = props.join(";");
        return propsStr;
     }

     exports.j2oneSkuImg = function(prop_1627207_value){
        var imageList = prop_1627207_value;
        var oldSkuPicList = [];
        for (var i = 0; i < imageList.length; i++) {
            var item = imageList[i];
            var oldItem = {};
            oldItem.url = item.imgUrl;
            var pv = this.parseProps("1627207", item)
            oldItem.properties = pv;
            oldSkuPicList.push(oldItem);
        };


        if(oldSkuPicList.length!=0)
            return oldSkuPicList;
        else
            return null;
     }

     exports.j2oneSku = function(jsonData){
        var map = jsonData;
        var oldSku = [];
        if(jsonData["sku"] != null){
            var skuList = jsonData["sku"];
            for (var i = 0; i < skuList.length; i++) {
                var oldItem = {};
                var item = skuList[i];
                var itemMap = item;
                var properties = [];
                for(var key in itemMap){
                    if(key.indexOf("prop_")>=0){
                        var p = key.replace("prop_", "");
                        var pv = this.parseProps(p, itemMap[key]);
                        properties.push(pv);
                    }
                }
                var pts = properties.join(";");
                oldItem.properties = pts;
                oldItem.barcode = item.barcode;
                oldItem.outerId = item.outerId;
                oldItem.price = item.price;
                oldItem.quantity = item.quantity;
                oldSku.push(oldItem);
            };
        }

        if(oldSku.length!=0)
            return oldSku;
        else
            return null;
     }

     exports.getInputPids = function(jsonData){
        var inputPids = [];
        var map = jsonData;
        for(var key in map){
            if(key.indexOf("prop_")>=0){
                var propObj = map[key];
                //单值
                if(this.getVarType(propObj) == "string"){
                    var p = key.replace("prop_", "");
                    inputPids.push(p);
                }
            }
        }
        if(inputPids.length != 0){
            var inputPidsStr = inputPids.join(",");
            return inputPidsStr;            
        }else{
            return null;
        }
     }
     
     exports.getinputStr = function(jsonData){
        var inputStr = [];
        var map = jsonData;
        for(var key in map){
            if(key.indexOf("prop_")>=0){
                var propObj = map[key];
                if(this.getVarType(propObj) == "string"){
                    inputStr.push(propObj);
                }
            }
        }
        if(inputStr.length != 0){
            var inputString = inputStr.join(",");
            return inputString;            
        }else{
            return null;
        }     
     }

     exports.getInputPidsFromMaterial = function(jsonData){
        var inputPids = [];
        var map = jsonData;
        for(var key in map){
            if(key.indexOf("prop_")>=0){
                var propObj = map[key];
                if(this.getVarType(propObj) == "array"){
                    if(this.isPropBelongMaterial(propObj)){
                        var p = key.replace("prop_", "");
                        inputPids.push(p);                    
                    }
                }
            }
        }

        if(inputPids.length != 0){
            var inputPidsStr = inputPids.join(",");
            return inputPidsStr;            
        }else{
            return null;
        }
     }

     exports.isPropBelongMaterial = function(propObj){
        if(this.getVarType(propObj) == "array"){
            for(var i=0; i<propObj.length; i++){
                var item = propObj[i];
                if(item.content!=null && item.text!=null && item.value!=null){
                    return true;
                }
            }
        }
        return false;
     }
     
     exports.getinputStrFromMaterial = function(jsonData){
        var inputStr = [];
        var map = jsonData;
        for(var key in map){
            if(key.indexOf("prop_")>=0){
                var propObj = map[key];
                if(this.getVarType(propObj) == "array"){
                    if(this.isPropBelongMaterial(propObj)){
                        var valueList = [];
                        for(var i=0; i<propObj.length; i++){
                            var item = propObj[i];
                            var value = '';
                            if(item.content.length != 0)
                                value = item.text+item.content+'%';
                            else
                                value = item.text;

                            valueList.push(value);
                        }
                        inputStr.push(valueList.join(' '));                      
                    }
                }
            }
        }
        if(inputStr.length != 0){
            var inputString = inputStr.join(",");
            return inputString;            
        }else{
            return null;
        }     
     }

     exports.convertJsonDataToOneLevelStr = function(jsonData){

        try{
            var onelevelStr = {};
            var onelevel = '';
            var jsonObj = JSON.parse(jsonData);

            //cid
            if(jsonObj.catId != null){
                onelevelStr.cid = jsonObj.catId;    
            }

            //num_iid
            if(jsonObj.itemId != null){
                onelevelStr.num_iid = jsonObj.itemId;          
            }

            //title
            if(jsonObj.title != null){
                onelevelStr.title = jsonObj.title;    
            }

            //subTitle
            if(jsonObj.subTitle != null){
                 onelevelStr.sell_point = jsonObj.subTitle;
            }

            //detailTemplate 不支持
            //saleMode 老版本的不支持

            //stuffStatus
            if(jsonObj.stuffStatus != null){
                if(jsonObj.stuffStatus === 5){
                    onelevelStr.stuff_status = 1;
                }else if(jsonObj.stuffStatus === 6){
                    onelevelStr.stuff_status = 3
                }        
            }

            //outerId
            if(jsonObj.outerId != null){
                onelevelStr.outer_id = jsonObj.outerId;           
            }

            //barcode
            if(jsonObj.barcode != null){
               onelevelStr.barcode = jsonObj.barcode; 
            }
            
            //price
            if(jsonObj.price != null){
                onelevelStr.price = jsonObj.price;       
            }


            //quantity
            if(jsonObj.quantity != null){
               onelevelStr.num = jsonObj.quantity; 
            }
            
            //全球购purchaseLocation
            if(jsonObj.purchaseLocation != null){
                var purchaseLocation = {};
                purchaseLocation = jsonObj.purchaseLocation;
                if(purchaseLocation.isGlobalStock == "false"){
                    onelevelStr.buy_area_type = 0;
                }else if(purchaseLocation.isGlobalStock == "true"){
                    onelevelStr.buy_area_type = 1;
                    var globalStock = purchaseLocation.globalStock;
                    if(globalStock != null){
                      onelevelStr.global_stock_type = globalStock.stockType;
                      onelevelStr.global_stock_country = globalStock.global_stock_country;                      
                    }
                }
            }

            //multiMedia
            if(jsonObj.multiMedia != null){
                var multiMedia = jsonObj.multiMedia;
                var imageVideo = multiMedia.imageVideo;
                if(imageVideo != null){
                    onelevelStr.imageVideo = imageVideo;
                }


                var jsonImg = multiMedia.image;
                if(jsonImg!=null){
                    var image = [];
                    for(var i=0; i<jsonImg.length; i++){
                        var imageItem = {};
                        imageItem.url = jsonImg[i].url;
                        imageItem.major = jsonImg[i].major;
                        imageItem.position = jsonImg[i].position;
                        image.push(imageItem);      
                    }
                    onelevelStr.image = image;
                }

            }

            //video不支持

            //descForPC
            if(jsonObj.descForPC != null){
                onelevelStr.descForPC = jsonObj.descForPC;  
            }

            //descForMobile
            if(jsonObj.descForMobile != null){
                var wirelessDesc = this.j2oneWirelessDesc(jsonObj.descForMobile);
                onelevelStr.wirelessDesc = wirelessDesc;           
            }

            //shopCats
            if(jsonObj.shopCats != null){
                var shopVar = jsonObj.shopCats;
                var sellerCids = [];
                for (var i = 0; i < shopVar.length; i++) {
                    var id = shopVar[i];
                    sellerCids.push(id);
                };

                if(sellerCids.length != 0){
                    onelevelStr.seller_cids = sellerCids.join(",");                    
                }
            }

            //deliverWay 另一钟是电子凭证，老版不支持
            if(jsonObj.deliverWay!=null && jsonObj.deliverWay == 1){
                //deliverTemplate
                if(jsonObj.deliverTemplate != null){
                    onelevelStr.postage_id = jsonObj.deliverTemplate;           
                }
            }


            //item_size item_weight
            if(jsonObj.deliveryParams != null){
                var deliveryParams = jsonObj.deliveryParams;
                onelevelStr.item_size = deliveryParams.deliverVolumn;
                onelevelStr.item_weight = deliveryParams.deliverWeight;          
            }


            //售后模板
            if(jsonObj.afterSale != null){
                var afterSale = jsonObj.afterSale;

                if(afterSale.invoice!=null){
                    onelevelStr.has_invoice = afterSale.invoice[0];
                }

                if(afterSale.warrant!=null){
                    onelevelStr.has_warranty = afterSale.warrant[0];
                }                
                
                if(afterSale.sellPromise!=null){
                    onelevelStr.sell_promise = afterSale.sellPromise[0];
                }

                if(afterSale.forceYes!=null){
                    onelevelStr.newprepay = 1;
                }else if(afterSale.forceNo!=null){
                    onelevelStr.newprepay = 0;
                }

                if(afterSale.forceYes==null 
                    && afterSale.forceNo==null 
                    && afterSale.custom!=null){
                    onelevelStr.newprepay = 1;
                }

                if(afterSale.forceYes==null 
                    && afterSale.forceNo==null 
                    && afterSale.custom==null){
                    onelevelStr.newprepay = 0;
                }          
            }

            //startTime
            if(jsonObj.startTime != null){
                onelevelStr.startTime = jsonObj.startTime;            
            }

            //promote
            if(jsonObj.promote != null){
                if(jsonObj.promote == 1){
                    onelevelStr.has_showcase = true;
                }else if(jsonObj.promote == 0){
                    onelevelStr.has_showcase = false;
                }    
            }else{
                onelevelStr.has_showcase = false;
            }

            //vipDiscount
            if(jsonObj.vipDiscount != null){
                if(jsonObj.vipDiscount == 1){
                    onelevelStr.has_discount = true;
                }else if(jsonObj.vipDiscount == 0){
                    onelevelStr.has_discount = false;
                }            
            }else{
                onelevelStr.has_discount = false;
            }

            //sub_stock
            if(jsonObj.subStockType != null){
                if(jsonObj.subStockType == 0){
                    onelevelStr.sub_stock = 1;
                }else if(jsonObj.subStockType==1){
                    onelevelStr.sub_stock = 2; 
                }            
            }

            //inputPids 
            var inputPids = this.getInputPids(jsonObj);
            if(inputPids != null){
                onelevelStr.inputPids = inputPids;
            }

            //inputStr
            var inputStr = this.getinputStr(jsonObj);
            if(inputStr != null){
                onelevelStr.inputStr = inputStr;
            }

            //材质
            var inputPidsMaterial = this.getInputPidsFromMaterial(jsonObj);
            if(inputPidsMaterial != null){
                onelevelStr.inputPids = inputPidsMaterial;
            }
            var inputStrMaterial = this.getinputStrFromMaterial(jsonObj);
            if(inputStrMaterial != null){
                onelevelStr.inputStr = inputStrMaterial;
            }            


            //prop 需实现
            onelevelStr.props = this.j2oneProps(jsonObj);

            //propName无法转换，因为没有
            onelevelStr.propsName = this.j2onePropsName(jsonObj);


            //prop_img 需实现
            if (jsonObj.prop_1627207 != null) {
                onelevelStr.skuimage = this.j2oneSkuImg(jsonObj.prop_1627207);
            }

            //inputCustomCpv 自定义属性
            var inputCustomCpv = this.j2oneInputCustomCpv(jsonObj);
            if(inputCustomCpv != null){
                onelevelStr.inputCustomCpv = inputCustomCpv;
            }
            
            //别名propAlias
            var propAlias = this.j2onePropAlias(jsonObj);
            if(propAlias != null){
                onelevelStr.propAlias = propAlias;
            }

            //备注Remark
            var propRemarks = this.j2onePropRemarks(jsonObj);
            if(propRemarks != null){
                onelevelStr.cpvMemo = propRemarks;
            }
            

            //sku 需实现
            onelevelStr.sku = this.j2oneSku(jsonObj);


            //preSale不支持

            //payment付款模式不支持

            //etc不支持

            //最后拼接成一个字符串
            onelevel = JSON.stringify(onelevelStr);
            shell.convertJsonDatatoEntity(onelevel);

        }catch(e){
            alert("convertJsonDatatoEntity error");
            alert(e);
        }
      }
     ///////////////////////////////////////////////

    var convertJsonToEntity = function (jsonstr) {
        exports.convertJsonDataToOneLevelStr(jsonstr);
    };

    bind("jsonToEntity", convertJsonToEntity);

 });