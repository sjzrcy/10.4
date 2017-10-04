/**
 * Created by diwu.sld on 2015/4/21.
 */

/*
尺码表入参和返回的转化
*/


function SizeMappingData(){
    /**
     * 尺码表维度的KEY，如：shengao,yaowei。自定义维度的KEY为：-1,-2,-3,-4,-5。
     */
        this.key = "";
        this.name = "";
        this.minValue  = "";
        this.maxValue = "";
        this.range =  false
};


var SizeMapping = {
    key :"",
    mappingDatas : []
    
}

var SizeMappingUtils = {
    findMappingData : function(key, mappingDatas){
        var found = -1;
        for (var oneMapping in mappingDatas){
            if(mappingDatas[oneMapping].key == key){
                found = oneMapping;
                break;
            }
        }

        return found;
    },
     isCustomData : function(key){
       return !isNaN(key);
     },

    isSizeMappingFieldContent : function(content){
        if (util.isBlank(content)) {
            return false;
        }

        var index  = content.trim().indexOf("0:尺码:");
        return ( index == 0);
    },

    getSizeMappingFields: function(sizeMappingContent){
        var sizeMappingFields = {};
        var contents = sizeMappingContent.trim().split(",");
        for(var i = 0; i < contents.length; ++i){
            var content = contents[i];

            if (util.isBlank(content)){
                continue;
            }

            if (!SizeMappingUtils.isSizeMappingFieldContent(content)) {
                continue;
            }

            var pairs = content.trim().split("=");
            if (pairs == null || pairs.length != 2) {
                continue;
            }

            var key = pairs[0];
            var fieldName = pairs[1];

            if (util.isBlank(key) || util.isBlank(fieldName)) {
                continue;
            }

           var keys = key.trim().split(":");
            if (keys == null || keys.length != 3) {
                continue;
            }

            var fieldKey = keys[2];

            if (util.isBlank(fieldKey)) {
                continue;
            }

            sizeMappingFields[fieldKey.trim()] = fieldName.trim();
        }
        return sizeMappingFields;
    },

    getSizeMapping : function (sizeMappingContent) {
        var  sizeMappings = {};
        if(util.isBlank(sizeMappingContent))return sizeMappings;

        var sizeMappingFields = SizeMappingUtils.getSizeMappingFields(sizeMappingContent);
        sizeMappings.sizeMappingFields = sizeMappingFields;

        var contents = sizeMappingContent.trim().split(",");
        for(var i = 0; i < contents.length; ++i) {
            var content = contents[i];
            if (util.isBlank(content)) {
                continue;
            }

            if (SizeMappingUtils.isSizeMappingFieldContent(content)) {
                continue;
            }

            var pairs = content.trim().split("=");

            if (pairs == null || pairs.length != 2) {
                continue;
            }

            var key = pairs[0];
            var value = pairs[1];

            if (util.isBlank(key) || util.isBlank(value)) {
                continue;
            }

            var keys = key.trim().split(":");
            if (keys == null || keys.length != 3) {
                continue;
            }

            var size = keys[1];
            var fieldKey = keys[2];

            if (util.isBlank(size) || util.isBlank(fieldKey)) {
                continue;
            }

            size = size.trim();
            fieldKey = fieldKey.trim();

            var range = false;
            var minValue = "";
            var maxValue = "";

            if (util.strEndWith(fieldKey, "_min")) {
                fieldKey = fieldKey.replace("_min", "");
                minValue = value;
                range = true;
            } else if (util.strEndWith(fieldKey, "_max")) {
                fieldKey = fieldKey.replace("_max", "");
                maxValue = value;
                range = true;
            } else {
                minValue = value;
                range = false;
            }

            if (util.isBlank(fieldKey)) {
                continue;
            }

            var fieldName = sizeMappingFields[fieldKey];

            if (util.isBlank(fieldName)) {
                continue;
            }

            var sizeMappingData = new SizeMappingData();
            sizeMappingData.key = fieldKey;
            sizeMappingData.name = fieldName;
            sizeMappingData.range = range;
            sizeMappingData.minValue = minValue;
            sizeMappingData.maxValue = maxValue;

            if(sizeMappings.hasOwnProperty(size)){
                var mappingDatas = sizeMappings[size];
                var found = false;

                for (var j = 0 ; j < mappingDatas.length; ++j){
                    var tmp = mappingDatas[j];
                    if(tmp.key == fieldKey){
                        if( util.isBlank(tmp.name)){
                            tmp.name = sizeMappingData.name;
                        }

                        if( util.isBlank(tmp.minValue)){
                            tmp.minValue = sizeMappingData.minValue;
                        }

                        if( util.isBlank(tmp.maxValue)){
                            tmp.maxValue = sizeMappingData.maxValue;
                        }

                        mappingDatas[j] = tmp;
                        found = true;
                        break;
                    }


                }
                if(!found){
                    mappingDatas.push(sizeMappingData);
                }

                sizeMappings[size] = mappingDatas;

            }else{
                var mappingDatas = [];
                mappingDatas.push(sizeMappingData);
                sizeMappings[size] = mappingDatas;
            }

        }

        return sizeMappings;
    },

    getSizeMappingEnumFields : function(sizeMapping){
        var sizeMappingFields = {};
        for ( prop in sizeMapping){
            var sizeMappingDatas = sizeMapping[prop];
            for( i in sizeMappingDatas){
                var mapingData = sizeMappingDatas[i];
                var key = mapingData.key.trim();
                var name = mapingData.name.trim();
                if(!util.isBlank(key) && !util.isBlank(name)){
                    if(!util.isBlank(mapingData.minValue) || !util.isBlank(mapingData.maxValue)){
                        sizeMappingFields[key] = name;
                    }
                    /*
                    if(isNaN(key)){
                        sizeMappingFields[key] = name;
                    }else{
                        //自定义
                        if(!util.isBlank(mapingData.minValue) || !util.isBlank(mapingData.maxValue)){
                            sizeMappingFields[key] = name;
                        }
                    }*/

                }
            }
        }
        return sizeMappingFields;
    },

    getSizeMappingEnumFieldsContent : function(sizeMappingFields){
        var content = "";
        for(prop in sizeMappingFields){
            var key = prop;
            var name = sizeMappingFields[prop];
            content =  content.concat("0:尺码:", key ,"=" ,name ,",");

        }

        if(content.length > 0){
            content = content.substr(0, content.length-1);
        }

        return content;

    },

    getSizeMappingDatasContent : function (sizeMappingFields, sizeMapping){
        var content = "";
        var index = 1;
        for ( var prop in sizeMapping){
            var sizeMappingDatas = sizeMapping[prop];
            var tmpObj = {};
            for( var i in sizeMappingDatas){
                var mapingData = sizeMappingDatas[i];
                var key = mapingData.key.trim();
                tmpObj[key] = mapingData;
            }

            for (var fieldProp in sizeMappingFields){
                var key = fieldProp;

                if(!tmpObj.hasOwnProperty(key)){
                    continue;
                }

                var sizeMappingData = tmpObj[key];
                if(sizeMappingData.range){
                    if (!util.isBlank(sizeMappingData.minValue)) {
                        content = content.concat(index, ":", prop.trim(), ":", key
                            , "_min=", sizeMappingData.minValue.trim(), ",");
                    }
                    if (!util.isBlank(sizeMappingData.maxValue)) {
                        content = content.concat(index, ":", prop.trim(), ":", key
                            , "_max=", sizeMappingData.maxValue.trim(), ",");
                    }

                }else{
                    if (!util.isBlank(sizeMappingData.minValue)) {
                        content = content.concat(index, ":", prop.trim(), ":", key
                            , "=", sizeMappingData.minValue.trim(), ",");
                    }
                }
            }

            index++;
        }
        if(content.length > 0){
            content = content.substr(0, content.length -1);
        }
        return content;
    },

    getSizeMappingContent : function(sizeMapping){
        if(null == sizeMapping){
            return "";
        }

        var sizeMappingFields = this.getSizeMappingEnumFields(sizeMapping);
        var content = this.getSizeMappingEnumFieldsContent(sizeMappingFields);
        if(util.isBlank(content)){
            return "";
        }

        var sizeMappingDatasContent = this.getSizeMappingDatasContent(sizeMappingFields, sizeMapping);
        if (util.isBlank(sizeMappingDatasContent)) {
            return content;
        } else {
            return content + "," + sizeMappingDatasContent;
        }
    }
}

var ComplexValueConvertor = {
    coustomRangeToComplex : function(child, sizeMappingData, complexValue){
        if("complex" == child.type()) {
            var customChildren = child.children();
            for (var customChildIndex in customChildren) {
                var customChild = customChildren[customChildIndex];
                customChild.parent = child.rawField();
                if("complex" != customChild.type
                    && customChild.id.indexOf("_name") >= 0){
                    var complexId = SizeTableConvertor.getComplexId(customChild, true, false);
                    complexValue[complexId] = sizeMappingData.name;
                }else{
                    var customRangeChildren = customChild.children;
                    for(var customRangeChildrenIndex in customRangeChildren){
                        var customRangeChild = customRangeChildren[customRangeChildrenIndex];
                        customRangeChild.parent = customChild;
                        var complexId = SizeTableConvertor.getComplexId(customRangeChild, true, true);
                        if(customRangeChild.id.indexOf("_from") >= 0){
                            complexValue[complexId] = sizeMappingData.minValue;
                        }else{
                            complexValue[complexId] = sizeMappingData.maxValue;
                        }
                    }
                }
            }
        }
    },

    rangeToComplex : function (child, sizeMappingData, complexValue) {
        var rangeChildren = child.children();
        for(var index in rangeChildren){
            var rangeChild = rangeChildren[index];
            var complexId = SizeTableConvertor.getComplexId(rangeChild, false, true);
            if(rangeChild.id.indexOf("_from") >= 0){
                complexValue[complexId] = sizeMappingData.minValue;
            }else{
                complexValue[complexId] = sizeMappingData.maxValue;
            }
        }
    },
    
    rangeFromCompex : function (key, field, sizeoption, complexValueList) {
       var mappingData = new SizeMappingData;
        mappingData.key = key;
        mappingData.name = field.name();
        for(var index in field.children()){
            var child = field.children()[index];
            var childId = SizeTableConvertor.getComplexId(child, false, true);

            var complexValue =  SizeTableConvertor.getComplexValue(sizeoption, complexValueList, childId);
            if(null != complexValue){
                var value = complexValue[childId]
                if(childId.indexOf("_from") > 0){
                    mappingData.minValue = value;
                }else{
                    mappingData.maxValue = value;
                }
            }
        }

        return mappingData;
    },

    customRangeFromCompex : function (costuMappingData, field, sizeoption, complexValueList, key){
        var rtnMappingData;
        var customChildren = field.children();
        for (var customChildIndex in customChildren){
            var customChild = customChildren[customChildIndex];
            if("complex" != customChild.type){
                var complexId = SizeTableConvertor.getComplexId(customChild, true, false);
                var complexValue =  SizeTableConvertor.getComplexValue(sizeoption, complexValueList, complexId);
                if(!complexValue || !complexValue.hasOwnProperty(complexId)) continue;
                if(complexId.indexOf("_name") > 0){
                    if(!costuMappingData){
                        costuMappingData = new SizeMappingData;
                    }
                    costuMappingData.name = complexValue[complexId];
                }
            }else{
                for (var customRangeChildIndex in customChild.children){
                    var customRangeChild = customChild.children[customRangeChildIndex];
                    customRangeChild.parent = customChild;
                    var complexId = SizeTableConvertor.getComplexId(customRangeChild, true, true);
                    var complexValue =  SizeTableConvertor.getComplexValue(sizeoption, complexValueList, complexId);

                    if(!complexValue || !complexValue.hasOwnProperty(complexId)) continue;

                    if(complexId.indexOf("_from") > 0){
                        if(!costuMappingData){
                            costuMappingData = new SizeMappingData;
                        }
                        costuMappingData.key = key;
                        costuMappingData.range = true;
                        costuMappingData.minValue = complexValue[complexId];
                        sourceCostumMappingData  = costuMappingData;

                    }else if(complexId.indexOf("_to") > 0){
                        if(!costuMappingData){
                            costuMappingData = new SizeMappingData;
                        }

                        costuMappingData.maxValue = complexValue[complexId];
                    }
                }

            }
        }

        rtnMappingData = costuMappingData;
        return rtnMappingData;
    }
}

var SizeTableConvertor = {
    isInStdSizeProp : function(id){
        return (id.indexOf("in_std_size_prop_") >= 0)
    },
    getChilren : function(sizeoption, sizeExtendField){
        var children = util.size.filterSizeExtendChildren(sizeExtendField, sizeoption);
        return children;
    },

    getkey : function(field){
        var key = field.rawId();
        key = key.replace("size_mapping_", "");
        key = key.replace("_range", "");
        return key
    },

    getComplexId: function(rawField, isCustom, isRange){
        var rtn = "";
        if(isRange){
            if(isCustom){
                var parentFiled = rawField.parent;
                var parentParentFiled = parentFiled.parent;
                if(parentParentFiled && parentFiled){
                    rtn = parentParentFiled.id + "," + parentFiled.id + "," + rawField.id;
                }
            }else{
                var parentFiled = rawField.parent;
                rtn = parentFiled.id + "," + rawField.id;
            }
        }else{
            if(isCustom){
                var parentFiled = rawField.parent;
                rtn = parentFiled.id + "," + rawField.id;

            }else{
                rtn = rawField.id;
            }
        }
        return rtn;

    },

    isKeyMatched : function(key, field){
        var rtn = false;
        if(SizeMappingUtils.isCustomData(key)){
            var customKey = ("size_mapping_"+key);
            rtn = (field.rawId().indexOf(customKey) >= 0);
        }else{
            rtn = (field.rawId().indexOf(key) >= 0);
        }

        return rtn;
    },

    getComplexValue : function(sizeOption, complexValueList, sizeId){
        for (var i = 0; i < complexValueList.length; ++i){
            var complexValue = complexValueList[i];
            if(complexValue[sizeOption.id] == sizeOption.value){
                if(complexValue[sizeId]){
                    return complexValueList[i];
                }
            }
        }

        return null
    },

    findChild : function(children, key, range){

        for (var i in children){
            var child = children[i];
            if(range){
                var tmp = "";
                if(SizeMappingUtils.isCustomData(key)){
                    tmp = key;
                }else{
                    tmp = key + "_range";
                }
                if(child.rawId().indexOf(tmp) >= 0){
                    return child;
                }

            }else{
                if(this.isKeyMatched(key, child)){
                    return child;
                }
            }
        }
        return null;
    },

    isObjectKeyContains : function(complexValueList, key){
        var rtn = false;
        if(complexValueList.length <= 0)return rtn;

        //因为一个尺码表不可能出现即是range 又是range 所以可以这样判断
        for(var objectKey in complexValueList[0]){
            if(objectKey.indexOf(key) >= 0){
                rtn = true;
                break;
            }
        }

        return rtn;
    },

    isRange : function(field, complexValueList){
        var range = (field.rawId().indexOf("_range") > 0);
        if(!range){
            var key  = this.getkey(field);
            if(SizeMappingUtils.isCustomData(key)){
                var customChildren = field.children();
                for(var index in customChildren){
                    var id = customChildren[index].id;
                    if(!this.isObjectKeyContains(complexValueList, id)){
                        continue;
                    }

                    if (id.indexOf("_range") > 0){
                        range = true;
                    }
                }
            }
        }


        return range;
    },

    convertFrom : function(sizeoptions, sizeExtendField){
        var rtn;
        //20509:140402416:UK10
        //pvPair=pid:vid:vtext,pid:vid:vtext
        var pvPair = "";

        var complexValueList =  sizeExtendField.complexValues();

        var sizeMappings = {};
        var inputStdIndex = 1;
        for (var i = 0; i < sizeoptions.length; ++i){
            var sizeId = sizeoptions[i].value;
            if(this.isInStdSizeProp(sizeoptions[i].id)){
                var dependVid = sizeoptions[i].dependVid;
                dependVid = dependVid.substring(0, dependVid.indexOf(":")+1);
                dependVid = dependVid + "-" + inputStdIndex;
                sizeId = dependVid;
                ++inputStdIndex;
            }else if(sizeoptions[i].id.indexOf("std_size_prop_") >= 0){
                var pid = "";
                var subs = sizeoptions[i].id.split("_");
                for (var subIndex in subs){
                    if(!isNaN(subs[subIndex])){
                        pid = subs[subIndex];
                        if(Number(pid) > 0)break;
                    }
                }
                sizeId = pid + ":";
                sizeId = sizeId + "-" + inputStdIndex;
                ++inputStdIndex;
            }
            var sizeName = sizeoptions[i].text;
            if(pvPair.length >0 ){
                pvPair = pvPair + ",";
            }
            pvPair = pvPair + sizeId + ":" + sizeName;

            var children = this.getChilren(sizeoptions[i], sizeExtendField);

            var mappingDatas = [];
            var tmpCustomMappingDatas = {};//key, mappingData
            for (var j = 0; j < children.length; ++j){
                var field = children[j];
                if(field.rawId().indexOf("size_mapping_") != 0) continue;
                var key  = this.getkey(field);
                var mappingData = null;
                var range = this.isRange(field, complexValueList);
                if (range){
                    if("complex" != field.type())  continue;

                    if(SizeMappingUtils.isCustomData(key)){
                        if("complex" != field.type())  continue;
                        var costuMappingData = tmpCustomMappingDatas[key];
                        costuMappingData = ComplexValueConvertor.customRangeFromCompex(costuMappingData
                                        , field, sizeoptions[i], complexValueList, key);
                        if(costuMappingData){
                            tmpCustomMappingDatas[key] = costuMappingData;
                        }

                    }else{
                        mappingData = ComplexValueConvertor.rangeFromCompex(key, field, sizeoptions[i], complexValueList);
                    }
                }else{
                    if(SizeMappingUtils.isCustomData(key)){
                        var costuMappingData = tmpCustomMappingDatas[key];
                        if("complex" != field.type())  continue;
                        var customChildren = field.children();

                        for (var customChildIndex in customChildren){
                            var customChild = customChildren[customChildIndex];
                            if("complex" != customChild.type){
                                var complexId = this.getComplexId(customChild, true, false);
                                var complexValue =  this.getComplexValue(sizeoptions[i], complexValueList, complexId);

                                if(!complexValue || !complexValue.hasOwnProperty(complexId)) continue;

                                if(complexId.indexOf("_value") > 0){
                                    if(!costuMappingData){
                                        costuMappingData = new SizeMappingData;
                                    }
                                    costuMappingData.key = key;
                                    costuMappingData.minValue = complexValue[complexId];

                                    tmpCustomMappingDatas[key] = costuMappingData;

                                }else if(complexId.indexOf("_name") > 0){
                                    if(!costuMappingData){
                                        costuMappingData = new SizeMappingData;
                                    }

                                    costuMappingData.name = complexValue[complexId];

                                    tmpCustomMappingDatas[key] = costuMappingData;
                                }

                            }
                        }
                    }else{
                        mappingData = new SizeMappingData;
                        mappingData.key = key;
                        var fieldId = field.rawId();
                        var complexValue =  this.getComplexValue(sizeoptions[i], complexValueList, fieldId);
                        if(null != complexValue){
                            var value = complexValue[fieldId];
                            mappingData.minValue = value;
                            mappingData.name = field.name();
                        }
                    }
                }

                if(null != mappingData){
                    mappingData.range = range;
                    mappingDatas.push(mappingData);
                }

            }

            for (var prop in tmpCustomMappingDatas){
                mappingDatas.push(tmpCustomMappingDatas[prop]);
            }
            sizeMappings[sizeName] = mappingDatas;


        }
        rtn = SizeMappingUtils.getSizeMappingContent(sizeMappings);

        rtn = "sizeMapping=" + rtn;
        rtn = rtn + "&pvPair=" + pvPair;
        debug.log(rtn);
        return rtn;
    },

    convertTo: function(sizeoptions, sizeExtendField, params){
        var getSizeMapping = SizeMappingUtils.getSizeMapping(params);
        var children =  this.getChilren(sizeoptions, sizeExtendField);

        var sizeMapings = [];
        for(var i in sizeoptions){
            var sizeoption = sizeoptions[i];
            var name = sizeoption.text;

            var sizeMappingDatas = getSizeMapping[name];
            if(sizeMappingDatas){
                var complexValue = {};
                for (var j in sizeMappingDatas){
                    var range = sizeMappingDatas[j].range;
                    var child = this.findChild(children, sizeMappingDatas[j].key, range);
                    if(child){
                        var key = this.getkey(child);
                        if(range){
                            if(SizeMappingUtils.isCustomData(key)){
                                ComplexValueConvertor.coustomRangeToComplex(child, sizeMappingDatas[j], complexValue);
                            }else{
                                 ComplexValueConvertor.rangeToComplex(child, sizeMappingDatas[j], complexValue);
                            }
                        }else{
                            if(SizeMappingUtils.isCustomData(key)){
                                if("complex" == child.type()){
                                    var customChildren = child.children();
                                    for (var customChildIndex in customChildren){
                                        var customChild = customChildren[customChildIndex];
                                        if("complex" != customChild.type){
                                            if(customChild.id.indexOf("_name") >= 0 ){
                                                var complexId = this.getComplexId(customChild, true, false);
                                                complexValue[complexId] = sizeMappingDatas[j].name;
                                            }else if(customChild.id.indexOf("_value") >= 0){
                                                var complexId = this.getComplexId(customChild, true, false);
                                                complexValue[complexId] = sizeMappingDatas[j].minValue;
                                            }
                                        }
                                    }

                                }else{
                                    debug.error("size table custom data error");
                                }
                            }else{
                                var complexId = this.getComplexId(child.rawField(), false, false);
                                complexValue[complexId] = sizeMappingDatas[j].minValue;
                            }
                        }
                    }
                }

                var valueCombine = {};
                valueCombine.sizeOption = sizeoption;
                valueCombine.complexValue = complexValue;
                sizeMapings.push(valueCombine);
            }
        }

        return sizeMapings;
    }
}


